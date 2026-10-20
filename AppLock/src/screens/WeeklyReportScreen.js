import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppLock } from "../context/AppLockContext";
import { getUnlockLog } from "../utils/usageTracker";
import PinkButton from "../components/PinkButton";
import CloseButton from "../components/CloseButton";
import PigIdleWebView from "../components/PigIdleWebView";
import { getLevel } from "../utils/pigWeight";
import { TopAppWeek } from "../components/ScreenTimeReport";

const PINK = "#F7A0B2";
const INK = "#2D2D2D";
const MUTED = "#6E6468";
const OUTLINE = { textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 };
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(t) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function hourLabel(h) {
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 === 0 ? 12 : h % 12} ${period}`;
}

function verdict(caves) {
  if (caves === 0) return "A clean week. We're suspicious.";
  if (caves <= 3) return "Not terrible. For a pig.";
  if (caves <= 10) return "Your master is disappointed.";
  return "An absolutely feral week.";
}

// Last 7 days (oldest → today) plus last week's totals, from the unlock log
function buildReport(log) {
  const today = startOfDay(Date.now());
  const days = Array.from({ length: 7 }, (_, i) => {
    const start = today - (6 - i) * DAY_MS;
    return {
      start,
      label: new Date(start).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      name: new Date(start).toLocaleDateString("en-US", { weekday: "long" }),
      caves: 0,
      coins: 0,
    };
  });
  const weekStart = days[0].start;
  const lastWeekStart = weekStart - 7 * DAY_MS;

  let peeks = 0, surrenders = 0, lastWeekCaves = 0, lastWeekCoins = 0;
  const hours = {};
  for (const e of log) {
    if (e.time >= weekStart) {
      // round, not floor: DST days are 23 or 25 hours long
      const d = days[Math.min(6, Math.round((startOfDay(e.time) - weekStart) / DAY_MS))];
      d.caves += 1;
      d.coins += e.fee || 0;
      if (e.kind === "peek") peeks += 1;
      else if (e.kind === "surrender") surrenders += 1;
      const h = new Date(e.time).getHours();
      hours[h] = (hours[h] || 0) + 1;
    } else if (e.time >= lastWeekStart) {
      lastWeekCaves += 1;
      lastWeekCoins += e.fee || 0;
    }
  }
  const caves = days.reduce((s, d) => s + d.caves, 0);
  const coins = days.reduce((s, d) => s + d.coins, 0);
  const worst = days.reduce((a, b) => (b.caves > a.caves ? b : a), days[0]);
  const peak = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];
  return {
    days, caves, coins, peeks, surrenders, lastWeekCaves, lastWeekCoins,
    worstDay: worst.caves > 0 ? worst : null,
    peakHour: peak ? Number(peak[0]) : null,
    range: `${new Date(weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(today).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
  };
}

export default function WeeklyReportScreen({ navigation }) {
  const { state } = useAppLock();
  const [report, setReport] = useState(null);

  useEffect(() => {
    getUnlockLog(14).then((log) => setReport(buildReport(log))).catch(() => setReport(buildReport([])));
  }, [state.totalCoinsSpent]);

  // Weekly report is a Pro perk (this also covers opening it from an old notification)
  if (!state.isProPig) {
    return (
      <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <View />
            <CloseButton onPress={() => navigation.goBack()} style={styles.closeBtn} />
          </View>
          <View style={styles.locked}>
            <PigIdleWebView size={150} level={getLevel(state.totalCoinsSpent).level} skin={state.activeSkin || "default"} silent />
            <Text style={styles.title}>Weekly Shame Report</Text>
            <Text style={styles.lockedBody}>
              Every cave, every coin, every weak moment of your week, laid out in full. A PRO perk.
            </Text>
            <PinkButton title="Unlock with PRO" onPress={() => navigation.replace("Paywall")} style={{ alignSelf: "stretch", marginTop: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!report) return <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={{ flex: 1 }} />;

  const rate = state.totalCoinsPurchased > 0 ? state.totalMoneySpent / state.totalCoinsPurchased : 4.99 / 50;
  const max = Math.max(1, ...report.days.map((d) => d.caves));
  const delta = report.lastWeekCaves > 0
    ? Math.round(((report.caves - report.lastWeekCaves) / report.lastWeekCaves) * 100)
    : null;
  const compare = report.lastWeekCaves === 0
    ? (report.caves > 0 ? "Last week was clean. What happened?" : "Two clean weeks in a row.")
    : delta > 0 ? `${delta}% more caves than last week.`
      : delta < 0 ? `${Math.abs(delta)}% fewer caves than last week. Barely.`
        : "Exactly as weak as last week.";

  return (
    <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.range}>{report.range}</Text>
          <CloseButton onPress={() => navigation.goBack()} style={styles.closeBtn} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Weekly Shame Report</Text>
          <Text style={styles.verdict}>{verdict(report.caves)}</Text>

          {/* Headline numbers */}
          <View style={styles.heroRow}>
            <View style={styles.heroCard}>
              <Text style={styles.heroValue}>{report.caves}</Text>
              <Text style={styles.heroLabel}>Caves</Text>
            </View>
            <View style={styles.heroCard}>
              <Text style={styles.heroValue}>{report.coins}</Text>
              <Text style={styles.heroLabel}>Coins wasted</Text>
            </View>
            <View style={styles.heroCard}>
              <Text style={styles.heroValue}>${(report.coins * rate).toFixed(0)}</Text>
              <Text style={styles.heroLabel}>Real money</Text>
            </View>
          </View>

          {/* Caves per day */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>CAVES BY DAY</Text>
            <View style={styles.chart}>
              {report.days.map((d, i) => (
                <View key={d.start} style={styles.barCol}>
                  <Text style={styles.barValue}>{d.caves || ""}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: `${(d.caves / max) * 100}%` }, i === 6 && styles.barToday]} />
                  </View>
                  <Text style={[styles.barDay, i === 6 && styles.barDayToday]}>{d.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Most-used app this week, from Screen Time */}
          <View style={[styles.card, styles.slopCard]}>
            <Text style={[styles.cardLabel, styles.slopLabel]}>BIGGEST SLOP</Text>
            <TopAppWeek />
          </View>

          {/* The breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>THE BREAKDOWN</Text>
            <Fact label="Peeks" value={report.peeks} />
            <Fact label="Full surrenders" value={report.surrenders} />
            <Fact label="Weakest day" value={report.worstDay ? `${report.worstDay.name} (${report.worstDay.caves})` : "None"} />
            <Fact label="Danger hour" value={report.peakHour != null ? hourLabel(report.peakHour) : "None"} />
            <Fact label="Iron Snout streak" value={`${state.ironSnoutStreak || 0} (best ${state.bestIronSnout || 0})`} last />
          </View>

          <View style={styles.compare}>
            <Text style={styles.compareText}>{compare}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Fact({ label, value, last }) {
  return (
    <View style={[styles.fact, !last && styles.factDivider]}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 8,
  },
  range: { fontSize: 13, fontWeight: "800", color: MUTED, letterSpacing: 0.5 },
  closeBtn: { backgroundColor: "#FFFFFF", borderColor: "rgba(247,160,178,0.35)" },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  title: { fontSize: 32, fontWeight: "900", color: PINK, letterSpacing: -1.2, marginTop: 10, ...OUTLINE },
  verdict: { fontSize: 16, fontWeight: "700", color: INK, marginTop: 2, marginBottom: 18 },

  heroRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  heroCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, paddingVertical: 14, paddingHorizontal: 12,
    shadowColor: "#C9A0B0", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 10,
  },
  heroValue: { fontSize: 28, fontWeight: "900", color: PINK, letterSpacing: -1, fontVariant: ["tabular-nums"], ...OUTLINE },
  heroLabel: { fontSize: 11, fontWeight: "700", color: INK, letterSpacing: 0.6, textTransform: "uppercase", marginTop: 2 },

  card: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 12,
    shadowColor: "#C9A0B0", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 10,
  },
  cardLabel: { fontSize: 11, fontWeight: "800", color: INK, letterSpacing: 1.4, marginBottom: 12 },
  slopCard: { paddingHorizontal: 0, paddingBottom: 8 },
  slopLabel: { paddingHorizontal: 16, marginBottom: 0 },

  chart: { flexDirection: "row", justifyContent: "space-between", height: 150 },
  barCol: { flex: 1, alignItems: "center" },
  barValue: { fontSize: 12, fontWeight: "800", color: INK, height: 16 },
  barTrack: { flex: 1, width: 22, borderRadius: 8, backgroundColor: "rgba(247,160,178,0.15)", justifyContent: "flex-end", overflow: "hidden" },
  bar: { width: "100%", borderRadius: 8, backgroundColor: PINK },
  barToday: { backgroundColor: "#E97C95" },
  barDay: { fontSize: 12, fontWeight: "700", color: MUTED, marginTop: 6 },
  barDayToday: { color: INK, fontWeight: "900" },

  fact: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 11 },
  factDivider: { borderBottomWidth: 1, borderBottomColor: "rgba(45,45,45,0.07)" },
  factLabel: { fontSize: 15, fontWeight: "600", color: INK },
  factValue: { fontSize: 15, fontWeight: "900", color: PINK, ...OUTLINE },

  compare: { alignItems: "center", marginTop: 6 },
  compareText: { fontSize: 15, fontWeight: "800", color: INK, textAlign: "center" },

  locked: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingBottom: 60 },
  lockedBody: { fontSize: 15, fontWeight: "600", color: INK, textAlign: "center", marginTop: 8, lineHeight: 21 },
});
