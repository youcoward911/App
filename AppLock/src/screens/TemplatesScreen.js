import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import PigMascot from "../components/PigMascot";
import { C, T, CARD_SHADOW_LG } from "../utils/theme";

// ── Textures / effects — visual samples ──────────────────
function TextureSample1() {
  // #1 Flat Solid
  return (
    <View style={[txStyles.wrap, { backgroundColor: C.bg }]}>
      <View style={[txStyles.card, { backgroundColor: "#FFF" }]}>
        <PigMascot size={36} animate={false} mood="happy" />
        <View style={txStyles.cardRight}>
          <Text style={txStyles.cardTitle}>FLAT SOLID</Text>
          <Text style={txStyles.cardSub}>CLEAN, NO TEXTURE</Text>
        </View>
      </View>
      <View style={[txStyles.btn, { backgroundColor: C.pink }]}>
        <Text style={txStyles.btnText}>PAY TRIBUTE</Text>
      </View>
    </View>
  );
}

function TextureSample2() {
  // #2 Gradient Cards
  return (
    <View style={[txStyles.wrap, { backgroundColor: C.bg }]}>
      <LinearGradient
        colors={[C.pink + "20", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={txStyles.card}
      >
        <PigMascot size={36} animate={false} mood="happy" />
        <View style={txStyles.cardRight}>
          <Text style={txStyles.cardTitle}>GRADIENT CARDS</Text>
          <Text style={txStyles.cardSub}>ACCENT FADE ON CARDS</Text>
        </View>
      </LinearGradient>
      <LinearGradient
        colors={[C.pink, C.pink + "AA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={txStyles.btn}
      >
        <Text style={txStyles.btnText}>PAY TRIBUTE</Text>
      </LinearGradient>
    </View>
  );
}

function TextureSample3() {
  // #3 Glassmorphism
  return (
    <View style={[txStyles.wrap, { backgroundColor: "#E8D0E0" }]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.5)", "rgba(255,255,255,0.2)"]}
        style={[txStyles.card, { borderWidth: 1, borderColor: "rgba(255,255,255,0.6)" }]}
      >
        <PigMascot size={36} animate={false} mood="happy" />
        <View style={txStyles.cardRight}>
          <Text style={txStyles.cardTitle}>GLASSMORPHISM</Text>
          <Text style={txStyles.cardSub}>FROSTED TRANSLUCENT</Text>
        </View>
      </LinearGradient>
      <View style={[txStyles.btn, { backgroundColor: "rgba(255,105,180,0.8)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" }]}>
        <Text style={txStyles.btnText}>PAY TRIBUTE</Text>
      </View>
      {/* Blurry background blobs */}
      <View style={{ position: "absolute", top: 10, left: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: C.pink + "40" }} />
      <View style={{ position: "absolute", bottom: 15, right: 25, width: 45, height: 45, borderRadius: 22, backgroundColor: "#AF52DE40" }} />
    </View>
  );
}

function TextureSample4() {
  // #4 Grain / Noise — simulated with tiny dot pattern
  const dots = [];
  for (let i = 0; i < 80; i++) {
    dots.push(
      <View
        key={i}
        style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: 1.5,
          height: 1.5,
          borderRadius: 0.75,
          backgroundColor: `rgba(0,0,0,${0.03 + Math.random() * 0.06})`,
        }}
      />
    );
  }
  return (
    <View style={[txStyles.wrap, { backgroundColor: "#FFF0F5" }]}>
      {dots}
      <View style={[txStyles.card, { backgroundColor: "#FFF" }]}>
        <PigMascot size={36} animate={false} mood="happy" />
        <View style={txStyles.cardRight}>
          <Text style={txStyles.cardTitle}>GRAIN / NOISE</Text>
          <Text style={txStyles.cardSub}>SUBTLE FILM TEXTURE</Text>
        </View>
      </View>
      <View style={[txStyles.btn, { backgroundColor: C.pink }]}>
        <Text style={txStyles.btnText}>PAY TRIBUTE</Text>
      </View>
    </View>
  );
}

function TextureSample5() {
  // #5 Glow Effects
  return (
    <View style={[txStyles.wrap, { backgroundColor: "#1A0A1E" }]}>
      <View style={[txStyles.card, {
        backgroundColor: "#2E1535",
        shadowColor: C.pink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
      }]}>
        <PigMascot size={36} animate={false} mood="happy" />
        <View style={txStyles.cardRight}>
          <Text style={[txStyles.cardTitle, { color: "#FFF" }]}>GLOW EFFECTS</Text>
          <Text style={[txStyles.cardSub, { color: "rgba(255,255,255,0.5)" }]}>NEON ACCENT GLOW</Text>
        </View>
      </View>
      <View style={[txStyles.btn, {
        backgroundColor: C.pink,
        shadowColor: C.pink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 15,
      }]}>
        <Text style={txStyles.btnText}>PAY TRIBUTE</Text>
      </View>
    </View>
  );
}

function TextureSample6() {
  // #6 Neumorphism
  return (
    <View style={[txStyles.wrap, { backgroundColor: "#E8E0E8" }]}>
      <View style={[txStyles.card, {
        backgroundColor: "#E8E0E8",
        shadowColor: "#FFF",
        shadowOffset: { width: -4, height: -4 },
        shadowOpacity: 0.7,
        shadowRadius: 6,
        elevation: 0,
        borderWidth: 0,
      }]}>
        <View style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: 14,
          shadowColor: "#A090A0",
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }} />
        <PigMascot size={36} animate={false} mood="happy" />
        <View style={txStyles.cardRight}>
          <Text style={[txStyles.cardTitle, { color: "#5A4060" }]}>NEUMORPHISM</Text>
          <Text style={[txStyles.cardSub, { color: "#8A7090" }]}>SOFT EXTRUDED</Text>
        </View>
      </View>
      <View style={[txStyles.btn, {
        backgroundColor: "#E8E0E8",
        shadowColor: "#A090A0",
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      }]}>
        <Text style={[txStyles.btnText, { color: C.pink }]}>PAY TRIBUTE</Text>
      </View>
    </View>
  );
}

const TEXTURE_SAMPLES = [
  { id: 1, name: "Flat Solid", component: TextureSample1 },
  { id: 2, name: "Gradient Cards", component: TextureSample2 },
  { id: 3, name: "Glassmorphism", component: TextureSample3 },
  { id: 4, name: "Grain / Noise", component: TextureSample4 },
  { id: 5, name: "Glow Effects", component: TextureSample5 },
  { id: 6, name: "Neumorphism", component: TextureSample6 },
];

// Keep other sections for reference
const PALETTES = [
  { id: 1, name: "Dark Burgundy", bg: "#2A0A14", card: "#3D1525", accent: "#FF2D55", text: "#FFF" },
  { id: 2, name: "Midnight Blush", bg: "#1A0A1E", card: "#2E1535", accent: "#E84393", text: "#FFF" },
  { id: 3, name: "Neon Dungeon", bg: "#0D0D0D", card: "#1A1A2E", accent: "#FF006E", text: "#FFF" },
  { id: 4, name: "Soft Pink", bg: "#FFE8EE", card: "#FFFFFF", accent: "#FF2D55", text: "#1C1C1E" },
  { id: 5, name: "Piggy Pastel (Active)", bg: "#FFF0F5", card: "#FFFFFF", accent: "#FF69B4", text: "#4A2040" },
  { id: 6, name: "Royal Gold", bg: "#1A1000", card: "#2E2208", accent: "#FFB800", text: "#FFF" },
  { id: 7, name: "Ice Cold", bg: "#0A1628", card: "#132040", accent: "#00D4FF", text: "#FFF" },
  { id: 8, name: "Blood Money", bg: "#1A0000", card: "#2E0A0A", accent: "#FF0033", text: "#FFF" },
  { id: 9, name: "Lavender Haze", bg: "#1A1028", card: "#2A1D40", accent: "#B36CFF", text: "#FFF" },
  { id: 10, name: "Toxic Green", bg: "#0A1A0A", card: "#152E15", accent: "#39FF14", text: "#FFF" },
];

const LAYOUTS = [
  { id: 1, name: "Centered Stack (Current)", desc: "Icon top, text center, button bottom" },
  { id: 2, name: "Left-Aligned", desc: "Icon left, text & button right-aligned" },
  { id: 3, name: "Full-Bleed", desc: "Edge-to-edge cards, no border radius, thin dividers" },
  { id: 4, name: "Floating Bubbles", desc: "Small rounded cards with heavy shadows, lots of spacing" },
  { id: 5, name: "Split Screen", desc: "Top half: pig + info, bottom half: app carousel" },
  { id: 6, name: "Minimal", desc: "No cards — text and icons directly on background" },
];

function Section({ title }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
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

        {/* ── TEXTURES — visual samples ── */}
        <TouchableOpacity onPress={() => toggle("textures")} activeOpacity={0.8}>
          <Section title="Textures & Effects" />
        </TouchableOpacity>
        {expandedSection === "textures" && TEXTURE_SAMPLES.map((t) => {
          const Sample = t.component;
          return (
            <View key={t.id} style={[styles.textureCard, CARD_SHADOW_LG]}>
              <View style={styles.textureHeader}>
                <Text style={styles.swatchNum}>#{t.id}</Text>
                <Text style={styles.textureName}>{t.name}</Text>
              </View>
              <Sample />
            </View>
          );
        })}

        {/* ── PALETTES ── */}
        <TouchableOpacity onPress={() => toggle("palettes")} activeOpacity={0.8}>
          <Section title="Color Palettes" />
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

        {/* ── LAYOUTS ── */}
        <TouchableOpacity onPress={() => toggle("layouts")} activeOpacity={0.8}>
          <Section title="Page Layouts" />
        </TouchableOpacity>
        {expandedSection === "layouts" && LAYOUTS.map((l) => (
          <View key={l.id} style={[styles.optionCard, CARD_SHADOW_LG]}>
            <Text style={styles.swatchNum}>#{l.id}</Text>
            <Text style={styles.optionName}>{l.name}</Text>
            <Text style={styles.optionDesc}>{l.desc}</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const txStyles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    width: "100%",
    marginBottom: 12,
  },
  cardRight: { marginLeft: 12, flex: 1 },
  cardTitle: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: C.text,
    textTransform: "uppercase",
  },
  cardSub: {
    fontSize: 10,
    fontWeight: "300",
    letterSpacing: 1,
    color: C.textTertiary,
    textTransform: "uppercase",
    marginTop: 2,
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  btnText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingBottom: 40 },
  title: { ...T.hero },
  sub: { ...T.caption, marginTop: 2, marginBottom: 20 },

  section: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { ...T.h1, color: C.pink },

  // Texture cards
  textureCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  textureHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  textureName: { ...T.bodyBold },

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
  miniText: { fontWeight: "900", fontSize: 14, marginLeft: 10, textTransform: "uppercase", letterSpacing: -0.5 },
  miniBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  miniBtnText: { color: "#FFF", fontWeight: "900", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },

  // Option cards
  optionCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  optionName: { ...T.bodyBold, marginTop: 4 },
  optionDesc: { ...T.caption, marginTop: 4 },
});
