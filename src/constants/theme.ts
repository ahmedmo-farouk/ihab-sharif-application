export const lightColors = {
  background: "#F7F4EE",
  card: "#FFFFFF",
  text: "#1B2430",
  muted: "#5A6675",
  border: "#E3DED3",
  primary: "#1E3A5F",
  danger: "#C0392B",
  tabBar: "#FFFFFF",
  inputBg: "#FFFFFF",
  accent: "#E3BC6A",
  headerBg: "#1E3A5F",
  headerText: "#FFFFFF",
  thumbPlaceholder: "#D6E0EE",
} as const;

export const darkColors = {
  background: "#0C1220",
  card: "#151D2E",
  text: "#EEF2F8",
  muted: "#93A0B5",
  border: "#24304A",
  primary: "#6EA8F0",
  danger: "#EF6B5B",
  tabBar: "#101829",
  inputBg: "#151D2E",
  accent: "#D9A74A",
  headerBg: "#101829",
  headerText: "#EEF2F8",
  thumbPlaceholder: "#1C2B47",
} as const;

export type AppColors = typeof lightColors;
