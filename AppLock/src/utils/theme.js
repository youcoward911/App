import { Platform } from "react-native";

// Soft pink-based palette inspired by modern iOS apps
export const C = {
  // Backgrounds — dark pink theme
  bg: "#2A0A14",
  bgSoft: "#3A1020",
  white: "#3D1525",
  card: "#3D1525",

  // Brand
  pink: "#FF2D55",
  pinkLight: "#FF6B8A",
  pinkPale: "rgba(255,45,85,0.25)",
  pinkBg: "#2A0A14",

  // Text — all white
  text: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.75)",
  textTertiary: "rgba(255,255,255,0.55)",
  textOnPink: "#FFFFFF",

  // Accent
  gold: "#FF9500",
  green: "#34C759",
  red: "#FF3B30",
  blue: "#007AFF",
  purple: "#AF52DE",

  // Utility
  border: "rgba(255,255,255,0.08)",
  shadow: "rgba(0,0,0,0.3)",
  overlay: "rgba(0,0,0,0.6)",
  divider: "rgba(255,255,255,0.08)",
};

// Consistent shadow for cards — like ChatGPT/Instagram
export const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
};

export const CARD_SHADOW_LG = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 5,
};

// System font on iOS = SF Pro, Android = Roboto
const FONT = Platform.OS === "ios" ? "System" : "Roboto";

export const T = {
  hero: {
    fontSize: 32,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  h1: {
    fontSize: 24,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.3,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  h2: {
    fontSize: 18,
    fontWeight: "600",
    color: C.text,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    color: C.textSecondary,
    lineHeight: 22,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500",
    color: C.textTertiary,
    letterSpacing: 0.2,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textTertiary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  stat: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  fee: {
    fontSize: 44,
    fontWeight: "900",
    color: C.pink,
    letterSpacing: -1,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  button: {
    fontSize: 16,
    fontWeight: "700",
    color: C.textOnPink,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
};
