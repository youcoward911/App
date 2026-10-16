import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");

const COLORS = [
  { name: "Current Mauve", hex: "#D4839B" },
  { name: "1. Warm Gray", hex: "#2D2D2D" },
  { name: "2. Dusty Rose", hex: "#C4918A" },
  { name: "3. Terracotta", hex: "#B87B6A" },
  { name: "4. Sage", hex: "#7A9182" },
  { name: "5. Warm Taupe", hex: "#2D2D2D" },
];

function Sample({ name, hex }) {
  return (
    <View style={styles.sample}>
      <Text style={styles.sampleLabel}>{name}</Text>
      <Text style={[styles.sampleHex, { color: hex }]}>{hex}</Text>

      {/* XP bar */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { backgroundColor: hex, width: "65%" }]} />
      </View>

      {/* Pill button */}
      <View style={[styles.pill, { backgroundColor: hex }]}>
        <Text style={styles.pillText}>Swipe to Lock Slop</Text>
      </View>

      {/* Tab mockup */}
      <View style={styles.tabRow}>
        <View style={[styles.tab, { backgroundColor: hex }]}>
          <Text style={styles.tabTextActive}>Apps</Text>
        </View>
        <View style={styles.tabInactive}>
          <Text style={[styles.tabTextInactive, { color: hex }]}>Stats</Text>
        </View>
        <View style={styles.tabInactive}>
          <Text style={[styles.tabTextInactive, { color: hex }]}>Settings</Text>
        </View>
      </View>

      {/* Gradient button */}
      <LinearGradient colors={[hex, shiftColor(hex, 30)]} style={styles.gradBtn}>
        <Text style={styles.gradBtnText}>Continue</Text>
      </LinearGradient>
    </View>
  );
}

function shiftColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((num >> 16) & 0xFF) + amount);
  const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
  const b = Math.min(255, (num & 0xFF) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function ColorSampleScreen({ navigation }) {
  return (
    <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Pick an Accent Color</Text>
          {COLORS.map((c) => (
            <Sample key={c.hex} name={c.name} hex={c.hex} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: "900", color: "#2D2D2D", marginBottom: 20, textAlign: "center" },
  sample: {
    marginBottom: 28,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  sampleLabel: { fontSize: 16, fontWeight: "800", color: "#2D2D2D", marginBottom: 4 },
  sampleHex: { fontSize: 28, fontWeight: "900", marginBottom: 12 },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.06)", marginBottom: 14 },
  barFill: { height: "100%", borderRadius: 4 },
  pill: { height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  pillText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabTextActive: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  tabInactive: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "rgba(255,255,255,0.3)" },
  tabTextInactive: { fontSize: 13, fontWeight: "700" },
  gradBtn: { height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  gradBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
