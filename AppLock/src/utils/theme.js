import { Platform } from "react-native";

// Palette #5: Piggy Pastel — soft lavender pink bg, hot pink accent
export const C = {
  // Backgrounds
  bg: "#FAE4E8",
  bgSoft: "#F5D8DE",
  white: "#FFFFFF",
  card: "#FFFFFF",

  // Brand — hot pink accent
  pink: "#FF69B4",
  pinkLight: "#FF8AC6",
  pinkPale: "#FFD6EB",
  pinkBg: "#FFF5FA",

  // Text — black
  text: "#4A2040",
  textSecondary: "#8E6080",
  textTertiary: "#B898A8",
  textOnPink: "#FFFFFF",

  // Accent
  gold: "#FF9500",
  green: "#34C759",
  red: "#FF3B30",
  blue: "#007AFF",
  purple: "#AF52DE",

  // Utility
  border: "rgba(0,0,0,0.04)",
  shadow: "rgba(0,0,0,0.08)",
  overlay: "rgba(0,0,0,0.4)",
  divider: "rgba(0,0,0,0.06)",
};

// Consistent shadow for cards
export const CARD_SHADOW = {
  shadowColor: "#C9A0B0",
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 3,
};

export const CARD_SHADOW_LG = {
  shadowColor: "#C9A0B0",
  shadowOffset: { width: 6, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 14,
  elevation: 5,
};

// Soft extruded neumorphic style — raised look
export const NEU_RAISED = {
  shadowColor: "#C9A0B0",
  shadowOffset: { width: 5, height: 5 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 4,
  // Apply inner highlight via border
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.7)",
};

// Soft extruded neumorphic style — pressed/inset look
export const NEU_INSET = {
  shadowColor: "#C9A0B0",
  shadowOffset: { width: -2, height: -2 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 0,
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.04)",
  backgroundColor: "#FFE8F0",
};

// Neon glow for accent elements
export const NEON_GLOW = {
  shadowColor: C.pink,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.6,
  shadowRadius: 16,
  elevation: 10,
};

export const NEON_GLOW_LG = {
  shadowColor: C.pink,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 28,
  elevation: 15,
};

// Font #2: Ultra Condensed — heavy tight headings, light wide body
const FONT = Platform.OS === "ios" ? "System" : "Roboto";

export const T = {
  hero: {
    fontSize: 32,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -1.5,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  h1: {
    fontSize: 24,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -1.2,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  h2: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -0.8,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  body: {
    fontSize: 15,
    fontWeight: "300",
    color: C.textSecondary,
    lineHeight: 22,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  caption: {
    fontSize: 12,
    fontWeight: "300",
    color: C.textTertiary,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textTertiary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  stat: {
    fontSize: 28,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -1.5,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  fee: {
    fontSize: 44,
    fontWeight: "900",
    color: C.pink,
    letterSpacing: -2,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
  button: {
    fontSize: 16,
    fontWeight: "900",
    color: C.textOnPink,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: FONT,
  },
};
