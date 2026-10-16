import { Platform } from "react-native";

// Palette #5: Piggy Pastel — soft lavender pink bg, hot pink accent
export const C = {
  // Backgrounds
  bg: "#FAE4E8",
  bgSoft: "#F5D8DE",
  white: "#FFFFFF",
  card: "#FFFFFF",

  // Brand
  pink: "#F7A0B2",
  pinkLight: "#F7A0B2",
  pinkPale: "#F0D4DE",
  pinkBg: "#FFF5F8",

  // Text
  text: "#2D2D2D",
  textSecondary: "#2D2D2D",
  textTertiary: "#2D2D2D",
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
    fontSize: 13,
    fontWeight: "600",
    color: C.textSecondary,
    lineHeight: 20,
    letterSpacing: 0.3,
    fontFamily: FONT,
  },
  bodyBold: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    letterSpacing: 0.3,
    fontFamily: FONT,
  },
  caption: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textTertiary,
    letterSpacing: 0.3,
    fontFamily: FONT,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textTertiary,
    letterSpacing: 0.3,
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
    fontSize: 13,
    fontWeight: "600",
    color: C.textOnPink,
    letterSpacing: 0.3,
    fontFamily: FONT,
  },
};
