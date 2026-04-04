import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import PigMascot from "../components/PigMascot";
import { C, T, CARD_SHADOW_LG } from "../utils/theme";

// ── Design palettes ──────────────────────────────────────
const PALETTES = [
  { id: 1, name: "Dark Burgundy (Current)", bg: "#2A0A14", card: "#3D1525", accent: "#FF2D55", text: "#FFF" },
  { id: 2, name: "Midnight Blush", bg: "#1A0A1E", card: "#2E1535", accent: "#E84393", text: "#FFF" },
  { id: 3, name: "Neon Dungeon", bg: "#0D0D0D", card: "#1A1A2E", accent: "#FF006E", text: "#FFF" },
  { id: 4, name: "Soft Pink (Light)", bg: "#FFE8EE", card: "#FFFFFF", accent: "#FF2D55", text: "#1C1C1E" },
  { id: 5, name: "Piggy Pastel", bg: "#FFF0F5", card: "#FFFFFF", accent: "#FF69B4", text: "#4A2040" },
  { id: 6, name: "Royal Gold", bg: "#1A1000", card: "#2E2208", accent: "#FFB800", text: "#FFF" },
  { id: 7, name: "Ice Cold", bg: "#0A1628", card: "#132040", accent: "#00D4FF", text: "#FFF" },
  { id: 8, name: "Blood Money", bg: "#1A0000", card: "#2E0A0A", accent: "#FF0033", text: "#FFF" },
  { id: 9, name: "Lavender Haze", bg: "#1A1028", card: "#2A1D40", accent: "#B36CFF", text: "#FFF" },
  { id: 10, name: "Toxic Green", bg: "#0A1A0A", card: "#152E15", accent: "#39FF14", text: "#FFF" },
];

// ── Font combos ──────────────────────────────────────────
const FONTS = [
  { id: 1, name: "System Bold (Current)", heading: { fontWeight: "800", letterSpacing: -0.5 }, body: { fontWeight: "400" } },
  { id: 2, name: "Ultra Condensed", heading: { fontWeight: "900", letterSpacing: -1.5 }, body: { fontWeight: "300", letterSpacing: 1 } },
  { id: 3, name: "Monospace Brut", heading: { fontWeight: "700", fontFamily: "Courier", letterSpacing: 2 }, body: { fontFamily: "Courier", fontWeight: "400" } },
  { id: 4, name: "Light & Airy", heading: { fontWeight: "300", letterSpacing: 2 }, body: { fontWeight: "300", letterSpacing: 0.5 } },
  { id: 5, name: "Heavy Slab", heading: { fontWeight: "900", letterSpacing: 0 }, body: { fontWeight: "600" } },
];

// ── Card layouts ─────────────────────────────────────────
const LAYOUTS = [
  { id: 1, name: "Centered Stack (Current)", desc: "Icon top, text center, button bottom" },
  { id: 2, name: "Left-Aligned", desc: "Icon left, text & button right-aligned" },
  { id: 3, name: "Full-Bleed", desc: "Edge-to-edge cards, no border radius, thin dividers" },
  { id: 4, name: "Floating Bubbles", desc: "Small rounded cards with heavy shadows, lots of spacing" },
  { id: 5, name: "Split Screen", desc: "Top half: pig + info, bottom half: app carousel" },
  { id: 6, name: "Minimal", desc: "No cards — text and icons directly on background" },
];

// ── Textures / effects ───────────────────────────────────
const TEXTURES = [
  { id: 1, name: "Flat Solid (Current)", desc: "Clean solid colors, no texture" },
  { id: 2, name: "Gradient Cards", desc: "Subtle gradient on each card from accent to transparent" },
  { id: 3, name: "Glassmorphism", desc: "Frosted glass cards with blur + translucent bg" },
  { id: 4, name: "Grain / Noise", desc: "Subtle grain texture overlay on background" },
  { id: 5, name: "Glow Effects", desc: "Neon glow around accent elements and buttons" },
  { id: 6, name: "Neumorphism", desc: "Soft extruded/inset shapes, minimal color" },
];

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function TemplatesScreen() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggle = (s) => setExpandedSection(expandedSection === s ? null : s);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Templates</Text>
        <Text style={styles.sub}>Pick what you like. Tell your master later.</Text>

        {/* ── PALETTES ── */}
        <TouchableOpacity onPress={() => toggle("palettes")} activeOpacity={0.8}>
          <Section title="1. Color Palettes" />
        </TouchableOpacity>
        {expandedSection === "palettes" && PALETTES.map((p) => (
          <View key={p.id} style={[styles.swatchCard, CARD_SHADOW_LG]}>
            <View style={styles.swatchHeader}>
              <Text style={styles.swatchNum}>#{p.id}</Text>
              <Text style={styles.swatchName}>{p.name}</Text>
            </View>
            <View style={styles.swatchRow}>
              <View style={[styles.swatch, { backgroundColor: p.bg }]}>
                <Text style={[styles.swatchLabel, { color: p.text }]}>BG</Text>
              </View>
              <View style={[styles.swatch, { backgroundColor: p.card }]}>
                <Text style={[styles.swatchLabel, { color: p.text }]}>CARD</Text>
              </View>
              <View style={[styles.swatch, { backgroundColor: p.accent }]}>
                <Text style={styles.swatchLabel}>ACCENT</Text>
              </View>
              <View style={[styles.swatch, { backgroundColor: p.text }]}>
                <Text style={[styles.swatchLabel, { color: p.text === "#FFF" ? "#000" : "#FFF" }]}>TEXT</Text>
              </View>
            </View>
            {/* Mini preview */}
            <View style={[styles.miniPreview, { backgroundColor: p.bg }]}>
              <View style={[styles.miniCard, { backgroundColor: p.card }]}>
                <PigMascot size={30} animate={false} mood="happy" />
                <Text style={[styles.miniText, { color: p.text }]}>PAYPIG</Text>
              </View>
              <View style={[styles.miniBtn, { backgroundColor: p.accent }]}>
                <Text style={styles.miniBtnText}>PAY TRIBUTE</Text>
              </View>
            </View>
          </View>
        ))}

        {/* ── FONTS ── */}
        <TouchableOpacity onPress={() => toggle("fonts")} activeOpacity={0.8}>
          <Section title="2. Font Styles" />
        </TouchableOpacity>
        {expandedSection === "fonts" && FONTS.map((f) => (
          <View key={f.id} style={[styles.fontCard, CARD_SHADOW_LG]}>
            <Text style={styles.swatchNum}>#{f.id}</Text>
            <Text style={[styles.fontHeading, f.heading]}>{f.name}</Text>
            <Text style={[styles.fontBody, f.body]}>
              AW, POOR LITTLE PIGGY NEEDS TO SCROLL?
            </Text>
            <Text style={[styles.fontBody, f.body, { marginTop: 4 }]}>
              Pay Tribute — 5 Coins
            </Text>
          </View>
        ))}

        {/* ── LAYOUTS ── */}
        <TouchableOpacity onPress={() => toggle("layouts")} activeOpacity={0.8}>
          <Section title="3. Page Layouts" />
        </TouchableOpacity>
        {expandedSection === "layouts" && LAYOUTS.map((l) => (
          <View key={l.id} style={[styles.optionCard, CARD_SHADOW_LG]}>
            <Text style={styles.swatchNum}>#{l.id}</Text>
            <Text style={styles.optionName}>{l.name}</Text>
            <Text style={styles.optionDesc}>{l.desc}</Text>
          </View>
        ))}

        {/* ── TEXTURES ── */}
        <TouchableOpacity onPress={() => toggle("textures")} activeOpacity={0.8}>
          <Section title="4. Textures & Effects" />
        </TouchableOpacity>
        {expandedSection === "textures" && TEXTURES.map((t) => (
          <View key={t.id} style={[styles.optionCard, CARD_SHADOW_LG]}>
            <Text style={styles.swatchNum}>#{t.id}</Text>
            <Text style={styles.optionName}>{t.name}</Text>
            <Text style={styles.optionDesc}>{t.desc}</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingBottom: 40 },
  title: { ...T.hero },
  sub: { ...T.caption, marginTop: 2, marginBottom: 20 },

  section: { marginTop: 12, marginBottom: 8 },
  sectionTitle: { ...T.h1, color: C.pink },

  // Swatch cards
  swatchCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  swatchHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  swatchNum: { ...T.label, color: C.pink, marginRight: 8, fontSize: 13, fontWeight: "900" },
  swatchName: { ...T.bodyBold },
  swatchRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  swatch: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchLabel: { color: "#FFF", fontSize: 9, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },

  // Mini preview
  miniPreview: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  miniCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    width: "100%",
    marginBottom: 8,
  },
  miniText: { fontWeight: "800", fontSize: 14, marginLeft: 10, textTransform: "uppercase", letterSpacing: 1 },
  miniBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  miniBtnText: { color: "#FFF", fontWeight: "800", fontSize: 11, textTransform: "uppercase" },

  // Font cards
  fontCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  fontHeading: { color: C.text, fontSize: 20, marginTop: 4, marginBottom: 6, textTransform: "uppercase" },
  fontBody: { color: C.textSecondary, fontSize: 14, textTransform: "uppercase" },

  // Option cards (layout + texture)
  optionCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  optionName: { ...T.bodyBold, marginTop: 4 },
  optionDesc: { ...T.caption, marginTop: 4 },
});
