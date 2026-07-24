/**
 * Ministry Form Builder Theme
 * Deep institutional green + gold seal accent on warm paper (light) / near-black forest (dark)
 * Serif display face (Fraunces) for form titles + geometric sans (Manrope) for UI chrome
 */

export type ThemeMode = "light" | "dark";

export interface MinistryTheme {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentDark: string;
  accentSoft: string;
  gold: string;
  goldSoft: string;
  danger: string;
  dangerSoft: string;
}

export const getMinistryTheme = (dark: boolean): MinistryTheme => ({
  bg: dark ? "#0A1310" : "#F7F8F3",
  surface: dark ? "#12201A" : "#FFFFFF",
  surfaceAlt: dark ? "#0E1A15" : "#F0F2EA",
  border: dark ? "#1F3327" : "#E4E7DC",
  borderStrong: dark ? "#2E4B3B" : "#D6DBC9",
  text: dark ? "#EDEFE7" : "#16231B",
  textMuted: dark ? "#93A899" : "#5C6B5F",
  textFaint: dark ? "#5E7266" : "#8A9689",
  accent: "#0E8F5C",
  accentDark: "#0B6B45",
  accentSoft: dark ? "rgba(14,143,92,0.16)" : "rgba(14,143,92,0.09)",
  gold: "#C9971F",
  goldSoft: dark ? "rgba(201,151,31,0.18)" : "rgba(201,151,31,0.12)",
  danger: "#D64545",
  dangerSoft: dark ? "rgba(214,69,69,0.14)" : "rgba(214,69,69,0.08)",
});

export const MINISTRY_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&display=swap');`;
