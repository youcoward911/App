export const COLORS = {
  // Backgrounds
  bg: "#08080F",
  bgCard: "#12121E",
  bgCardHover: "#1A1A2E",
  bgElevated: "#1E1E32",
  bgInput: "#16162A",

  // Brand
  pink: "#FF2D78",
  pinkDark: "#D4205F",
  pinkSoft: "rgba(255, 45, 120, 0.12)",
  pinkGlow: "rgba(255, 45, 120, 0.25)",

  // Accents
  gold: "#FFD666",
  goldDark: "#E5B84C",
  goldSoft: "rgba(255, 214, 102, 0.12)",
  mint: "#5CFFB1",
  mintSoft: "rgba(92, 255, 177, 0.12)",
  purple: "#A855F7",
  purpleSoft: "rgba(168, 85, 247, 0.12)",

  // Text
  text: "#FFFFFF",
  textSecondary: "#A1A1B5",
  textMuted: "#5E5E72",
  textDim: "#3D3D52",

  // Borders
  border: "#1F1F35",
  borderLight: "#2A2A45",
  borderPink: "rgba(255, 45, 120, 0.3)",

  // Utility
  overlay: "rgba(8, 8, 15, 0.92)",
  shadow: "#000000",
};

export const GRADIENTS = {
  card: [COLORS.bgCard, "#0F0F1A"],
  pink: ["#FF2D78", "#FF6B9D"],
  pinkDark: ["#D4205F", "#FF2D78"],
  gold: ["#FFD666", "#FFAB40"],
  dark: ["#12121E", "#08080F"],
  header: ["rgba(8,8,15,1)", "rgba(8,8,15,0)"],
};

export const SHADOW = {
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 8,
};

export const SHADOW_PINK = {
  shadowColor: COLORS.pink,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 8,
};

export const FONTS = {
  heroTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  roast: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.pink,
    fontStyle: "italic",
    lineHeight: 32,
  },
  fee: {
    fontSize: 42,
    fontWeight: "900",
    color: COLORS.gold,
    letterSpacing: -1,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
};
