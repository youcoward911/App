import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PINK = "#F7A0B2";
const INK = "#2D2D2D";
const MUTED = "#6E6468";
const OUTLINE = { textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 };

// Made-up week used to show off the Weekly Shame Report on the paywall
const SAMPLE_DAYS = [
  { label: "M", caves: 2 },
  { label: "T", caves: 5 },
  { label: "W", caves: 1 },
  { label: "T", caves: 3 },
  { label: "F", caves: 6 },
  { label: "S", caves: 4 },
  { label: "S", caves: 2 },
];

// A miniature Weekly Shame Report, clearly marked as an example
export default function ShameReportPreview({ style }) {
  const max = Math.max(...SAMPLE_DAYS.map((d) => d.caves));
  return (
    <View style={[styles.card, style]}>
      <View style={styles.headRow}>
        <Text style={styles.title}>Weekly Shame Report</Text>
        <View style={styles.exampleTag}><Text style={styles.exampleText}>EXAMPLE</Text></View>
      </View>
      <Text style={styles.verdict}>An absolutely feral week.</Text>

      <View style={styles.statsRow}>
        <Stat value="23" label="Caves" />
        <Stat value="410" label="Coins" />
        <Stat value="$41" label="Real money" />
      </View>

      <View style={styles.chart}>
        {SAMPLE_DAYS.map((d, i) => (
          <View key={i} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { height: `${(d.caves / max) * 100}%` }, d.caves === max && styles.barWorst]} />
            </View>
            <Text style={styles.barDay}>{d.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.slopRow}>
        <View style={styles.slopIcon}><Text style={styles.slopIconText}>T</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.slopLabel}>BIGGEST SLOP</Text>
          <Text style={styles.slopName}>TikTok <Text style={styles.slopTime}>· 9h 40m this week</Text></Text>
        </View>
      </View>

      <View style={styles.facts}>
        <Text style={styles.fact}>Weakest day: <Text style={styles.factValue}>Friday</Text></Text>
        <Text style={styles.fact}>Danger hour: <Text style={styles.factValue}>11 PM</Text></Text>
      </View>
      <Text style={styles.compare}>40% more caves than last week.</Text>
    </View>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch", backgroundColor: "#FFFFFF", borderRadius: 22, padding: 16,
    borderWidth: 2.5, borderColor: PINK,
    shadowColor: "#E97C95", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.22, shadowRadius: 12,
  },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { fontSize: 18, fontWeight: "900", color: PINK, letterSpacing: -0.5, flexShrink: 1, ...OUTLINE },
  exampleTag: { backgroundColor: "rgba(45,45,45,0.08)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  exampleText: { fontSize: 10, fontWeight: "900", color: MUTED, letterSpacing: 1 },
  verdict: { fontSize: 13, fontWeight: "700", color: INK, marginTop: 2, marginBottom: 12 },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  stat: { flex: 1, backgroundColor: "rgba(247,160,178,0.1)", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  statValue: { fontSize: 20, fontWeight: "900", color: PINK, letterSpacing: -0.6, ...OUTLINE },
  statLabel: { fontSize: 10, fontWeight: "700", color: INK, letterSpacing: 0.5, textTransform: "uppercase" },

  chart: { flexDirection: "row", justifyContent: "space-between", height: 78 },
  barCol: { flex: 1, alignItems: "center" },
  barTrack: { flex: 1, width: 16, borderRadius: 6, backgroundColor: "rgba(247,160,178,0.15)", justifyContent: "flex-end", overflow: "hidden" },
  bar: { width: "100%", borderRadius: 6, backgroundColor: PINK },
  barWorst: { backgroundColor: "#E97C95" },
  barDay: { fontSize: 11, fontWeight: "700", color: MUTED, marginTop: 4 },

  slopRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  slopIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: INK, alignItems: "center", justifyContent: "center" },
  slopIconText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  slopLabel: { fontSize: 10, fontWeight: "800", color: MUTED, letterSpacing: 1 },
  slopName: { fontSize: 15, fontWeight: "900", color: INK },
  slopTime: { fontSize: 13, fontWeight: "800", color: PINK },
  facts: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  fact: { fontSize: 13, fontWeight: "600", color: INK },
  factValue: { fontWeight: "900", color: PINK },
  compare: { fontSize: 13, fontWeight: "800", color: INK, marginTop: 8 },
});
