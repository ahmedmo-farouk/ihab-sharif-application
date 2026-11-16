import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const inputCsv = "lectures.csv";
const outputJson = "src/data/catalog.json";
const outputDir = "./public/videos"; // مجلد حفظ الملفات المحولة محلياً

// 1. قراءة وتنظيف ملف الـ CSV
const text = fs.readFileSync(inputCsv, "utf8").replace(/^\uFEFF/, "");
const rows = Papa.parse(text, { header: true, skipEmptyLines: true }).data;

const extOf = (u) =>
  (u.split("?")[0].match(/\.([a-z0-9]+)$/i)?.[1] ?? "").toLowerCase();
const hash = (s) => {
  let h = 5381;
  for (const c of s) h = ((h * 33) ^ c.codePointAt(0)) >>> 0;
  return h.toString(36);
};
const videoFileName = (seriesName, url) =>
  `${createHash("sha256").update(`${seriesName}\0${url}`).digest("hex")}.mp4`;

const mediaRows = [];
const insecureRows = [];

for (const [index, row] of rows.entries()) {
  const seriesName = (row.series_name ?? "")
    .replace(/"/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const rawUrl = (row.link ?? "").trim();
  if (!seriesName || !rawUrl) continue;

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid media URL in CSV row ${index + 2}.`);
  }

  if (url.protocol !== "https:") {
    insecureRows.push(index + 2);
    continue;
  }

  mediaRows.push({
    row,
    seriesName,
    url: url.href,
    fileName: path.basename(url.pathname),
  });
}

if (insecureRows.length > 0) {
  const examples = insecureRows.slice(0, 10).join(", ");
  throw new Error(
    `Refusing to build the catalog: ${insecureRows.length} media links are not HTTPS (CSV rows ${examples}${insecureRows.length > 10 ? ", ..." : ""}). Update the source URLs; they will not be upgraded automatically.`,
  );
}

fs.mkdirSync(outputDir, { recursive: true });

function parseTitle(raw) {
  let t = raw.replace(/\s+/g, " ").trim();
  const sp = t.match(/الشيخ\s*\/\s*([^,]+)$/);
  const speaker = sp ? sp[1].trim() : "إيهاب الشريف";
  t = t.replace(/[\s.\-–]*الشيخ\s*\/.*$/, "");
  const num = t.match(/^\s*0*(\d+)\s*[-–]/);
  t = t
    .replace(/^\s*\d+\s*[-–]\s*/, "")
    .replace(/\(\s*\)/g, "")
    .trim();
  return { title: t, number: num ? Number(num[1]) : null, speaker };
}

const seriesMap = new Map();

console.log("🔄 جاري معالجة وتحويل الملفات...");

for (const { row: r, seriesName: sName, url, fileName } of mediaRows) {
  const { title, ...meta } = parseTitle(r.lesson_name ?? "");
  const key = `${meta.number ?? ""}|${title}`;
  const n = Number(r.lesson_number) || 0;
  const s = seriesMap.get(sName) ?? { title: sName, map: new Map() };
  seriesMap.set(sName, s);

  const l = s.map.get(key) ?? {
    title,
    ...meta,
    order: n,
    audio: [],
    video: [],
    wmvUrl: null,
  };
  s.map.set(key, l);

  const e = extOf(url);

  if (e === "mp3" || e === "m4a") {
    l.audio.push(url);
  } else if (e === "mp4" || e === "m4v") {
    l.video.push(url);
  } else if (e === "wmv") {
    // إذا كان الملف WMV، نقوم بتحميله وتحويله محلياً إلى MP4
    const outputName = videoFileName(sName, url);
    const outputMp4Path = path.join(outputDir, outputName);
    const partialMp4Path = path.join(outputDir, `${outputName}.partial.mp4`);
    const localRelativeUrl = `/videos/${outputName}`;

    if (!fs.existsSync(outputMp4Path)) {
      console.log(`[تحويل WMV] جاري معالجة: ${fileName}`);
      const result = spawnSync(
        "ffmpeg",
        [
          "-i",
          url,
          "-c:v",
          "libx264",
          "-crf",
          "23",
          "-preset",
          "fast",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-movflags",
          "+faststart",
          "-y",
          partialMp4Path,
        ],
        { stdio: "inherit" },
      );

      if (result.error) {
        throw new Error(
          `Could not start ffmpeg for ${fileName}: ${result.error.message}`,
        );
      }
      if (result.status !== 0) {
        throw new Error(
          `ffmpeg failed to convert ${fileName} (exit code ${result.status}).`,
        );
      }
      if (
        !fs.existsSync(partialMp4Path) ||
        fs.statSync(partialMp4Path).size === 0
      ) {
        throw new Error(`ffmpeg produced no output for ${fileName}.`);
      }

      fs.renameSync(partialMp4Path, outputMp4Path);
      console.log(`✅ تم تحويل بنجاح: ${outputName}`);
    }

    // نعتبر الملف المتحول بمثابة رابط فيديو صالح للاستخدام
    l.video.push(localRelativeUrl);
  }
}

// 2. بناء الكتالوج النهائي النهئي
const series = [];
for (const s of seriesMap.values()) {
  const lessons = [...s.map.values()];
  series.push({
    id: hash(s.title),
    title: s.title,
    lessons: lessons.map((l, i) => ({
      id: hash(`${s.title}|${l.number}|${l.title}`),
      title: l.title || `الحلقة ${l.number ?? i + 1}`,
      number: l.number,
      speaker: l.speaker,
      audio: l.audio[0],
      video: l.video[0],
    })),
  });
}

fs.mkdirSync(path.dirname(outputJson), { recursive: true });
fs.writeFileSync(outputJson, JSON.stringify(series, null, 2));

console.log("\n✨ تمت عملية التحويل وبناء الكتالوج بنجاح!");
console.log(`📂 تم حفظ الفيديوهات المحولة في: ${outputDir}`);
console.log(`📄 تم تحديث الكتالوج في: ${outputJson}`);
