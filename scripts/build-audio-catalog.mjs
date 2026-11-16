import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const inputCsv = "lectures.csv";
const outputJson = "src/data/audioLinks.json";

if (!fs.existsSync(inputCsv)) {
  throw new Error(`Missing audio catalog source: ${inputCsv}`);
}

const text = fs.readFileSync(inputCsv, "utf8").replace(/^\uFEFF/, "");
const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

if (parsed.errors.length > 0) {
  throw new Error(`Could not parse ${inputCsv}: ${parsed.errors[0].message}`);
}

const audioLinks = [];
const insecureRows = [];

for (const [index, row] of parsed.data.entries()) {
  const seriesName = (row.series_name ?? "").trim();
  const lessonName = (row.lesson_name ?? "").trim();
  const url = (row.link ?? "").trim();

  if (!url) continue;

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    if (/\.mp3(?:[?#].*)?$/i.test(url)) {
      throw new Error(`Audio row ${index + 2} has an invalid URL.`);
    }
    continue;
  }

  if (!/\.mp3$/i.test(parsedUrl.pathname)) continue;
  if (!seriesName || !lessonName) {
    throw new Error(`Audio row ${index + 2} is missing its series or lesson name.`);
  }

  if (parsedUrl.protocol !== "https:") {
    insecureRows.push(index + 2);
    continue;
  }

  audioLinks.push({ seriesName, lessonName, url: parsedUrl.href });
}

if (insecureRows.length > 0) {
  const examples = insecureRows.slice(0, 10).join(", ");
  throw new Error(
    `Refusing to build the audio catalog: ${insecureRows.length} MP3 links are not HTTPS (CSV rows ${examples}${insecureRows.length > 10 ? ", ..." : ""}). Update the source URLs; they will not be upgraded automatically.`,
  );
}

if (audioLinks.length === 0) {
  throw new Error(`No MP3 links found in ${inputCsv}`);
}

fs.mkdirSync(path.dirname(outputJson), { recursive: true });
fs.writeFileSync(outputJson, JSON.stringify(audioLinks));
console.log(`Generated ${audioLinks.length} audio links in ${outputJson}.`);
