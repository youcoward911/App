import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "../context/AppLockContext";
import PigMascot from "../components/PigMascot";
import { POPULAR_APPS } from "../data/defaultApps";
import { getFullUsage, formatCaveTime, getTopAppsBySpend, getWeeklyReport, getScreenTimeData } from "../utils/usageTracker";
import { getPigWeight, getWeightProgress, WEIGHT_TIERS } from "../utils/pigWeight";
import { C, T, NEU_RAISED } from "../utils/theme";

function appName(appId) {
  const app = POPULAR_APPS.find((a) => a.id === appId);
  return app ? app.name : appId;
}

export default function StatsScreen() {
  const { state } = useAppLock();
  const [usage, setUsage] = useState(null);
  const [topAppsSpend, setTopAppsSpend] = useState([]);
  const [spendPeriod, setSpendPeriod] = useState("today");
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [chartPeriod, setChartPeriod] = useState("weekly");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    getFullUsage().then((data) => setUsage(data));
  }, [state.totalUnlocks]);

  useEffect(() => {
    getTopAppsBySpend(spendPeriod, 5).then(setTopAppsSpend);
  }, [state.totalUnlocks, spendPeriod]);

  useEffect(() => {
    if (state.isProPig) {
      getWeeklyReport().then(setWeeklyReport);
    }
  }, [state.totalUnlocks, state.isProPig]);

  useEffect(() => {
    if (state.isProPig) {
      getScreenTimeData(chartPeriod).then(setChartData);
    }
  }, [state.totalUnlocks, chartPeriod, state.isProPig]);

  const today = new Date().toDateString();
  const tribToday = state.tributesTodayDate === today ? (state.tributesToday || 0) : 0;

  // Top 3 apps
  const appEntries = usage ? Object.entries(usage.appUnlocks || {}).sort((a, b) => b[1] - a[1]) : [];
  const topApps = appEntries.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Hall of Shame</Text>
        <Text style={styles.sub}>Your master keeps score</Text>

        {/* Weight Class — hero card */}
        {(() => {
          const wt = getPigWeight(state.totalCoinsSpent);
          const wp = getWeightProgress(state.totalCoinsSpent);
          const wtIdx = WEIGHT_TIERS.findIndex((t) => t.key === wt.key);
          const nextTier = wtIdx >= 0 && wtIdx < WEIGHT_TIERS.length - 1 ? WEIGHT_TIERS[wtIdx + 1] : null;
          return (
            <View style={[styles.heroCard, NEU_RAISED]}>
              <PigMascot size={70} mood={state.totalUnlocks > 15 ? "happy" : "restless"} weight={wt.key} />
              <View style={styles.heroLabelRow}>
                <Text style={styles.heroLabel}>WEIGHT CLASS</Text>
                <TouchableOpacity
                  style={styles.infoBtn}
                  onPress={() => Alert.alert(
                    "Weight Class",
                    "Your pig gets fatter every time you eat your slop. The more coins you spend on unlocks, the bigger and rounder your pig grows. Feed it well.",
                    [{ text: "Got it" }]
                  )}
                >
                  <Text style={styles.infoBtnText}>?</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.heroValue, { color: C.pink }]}>
                {wt.label}
              </Text>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${wp * 100}%`, backgroundColor: C.pink }]} />
              </View>
              {nextTier ? (
                <Text style={styles.weightNext}>Next Level: {nextTier.label}</Text>
              ) : (
                <Text style={styles.weightNext}>MAX TIER. Absolute unit.</Text>
              )}
            </View>
          );
        })()}

        {/* Tributes row */}
        <View style={styles.statRow}>
          <View style={[styles.statCard, NEU_RAISED]}>
            <Text style={styles.statVal}>{tribToday}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={[styles.statCard, NEU_RAISED]}>
            <Text style={[styles.statVal, { color: C.pink }]}>{state.totalUnlocks}</Text>
            <Text style={styles.statLabel}>Total Tributes</Text>
          </View>
        </View>

        {/* Coins spent */}
        <View style={styles.statRow}>
          <View style={[styles.statCard, NEU_RAISED]}>
            <Text style={styles.statVal}>{usage?.totalCoinsSpent || 0}</Text>
            <Text style={styles.statLabel}>Coins Spent</Text>
          </View>
          <View style={[styles.statCard, NEU_RAISED]}>
            <Text style={styles.statVal}>{usage?.totalOpens || 0}</Text>
            <Text style={styles.statLabel}>App Opens</Text>
          </View>
        </View>

        {/* Cave time */}
        {usage && usage.averageCaveTime > 0 && (
          <View style={[styles.sectionCard, NEU_RAISED]}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>AVERAGE CAVE TIME</Text>
              <TouchableOpacity
                style={styles.infoBtn}
                onPress={() => Alert.alert(
                  "Average Cave Time",
                  "How long you resist before caving in and paying tribute. Measured from when you lock an app to when you unlock it. Lower is weaker.",
                  [{ text: "Got it" }]
                )}
              >
                <Text style={styles.infoBtnText}>?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.weakRow}>
              <Text style={styles.weakVal}>{formatCaveTime(usage.averageCaveTime)}</Text>
            </View>
          </View>
        )}

        {/* Streak */}
        {usage && (usage.streakDays > 0 || usage.longestStreak > 0) && (
          <View style={styles.statRow}>
            <View style={[styles.statCard, NEU_RAISED]}>
              <Text style={[styles.statVal, { color: "#FF6B35" }]}>{usage.streakDays}</Text>
              <View style={styles.labelRow}>
                <Text style={styles.statLabel}>Day Streak</Text>
                <TouchableOpacity
                  style={styles.infoBtn}
                  onPress={() => Alert.alert(
                    "Day Streak",
                    "How many days in a row you've opened the app and paid at least one tribute. Miss a day and it resets to zero.",
                    [{ text: "Got it" }]
                  )}
                >
                  <Text style={styles.infoBtnText}>?</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.statCard, NEU_RAISED]}>
              <Text style={styles.statVal}>{usage.longestStreak}</Text>
              <Text style={styles.statLabel}>Longest Streak</Text>
            </View>
          </View>
        )}

        {/* Iron Snout + Peek/Surrender stats */}
        <View style={styles.statRow}>
          <View style={[styles.statCard, NEU_RAISED]}>
            <View style={styles.statBadge}><Text style={styles.statBadgeText}>IS</Text></View>
            <Text style={[styles.statVal, { color: "#FF6B35" }]}>{state.ironSnoutStreak || 0}</Text>
            <View style={styles.labelRow}>
              <Text style={styles.statLabel}>Iron Snout</Text>
              <TouchableOpacity
                style={styles.infoBtn}
                onPress={() => Alert.alert(
                  "Iron Snout",
                  "Every time a lock timer expires naturally without you peeking or surrendering, your Iron Snout streak goes up. Any peek or full unlock resets it. How disciplined are you?",
                  [{ text: "Oink" }]
                )}
              >
                <Text style={styles.infoBtnText}>?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={[styles.statCard, NEU_RAISED]}>
            <Text style={styles.statVal}>{state.totalPeeks || 0}</Text>
            <Text style={styles.statLabel}>Peeks</Text>
          </View>
          <View style={[styles.statCard, NEU_RAISED]}>
            <Text style={[styles.statVal, { color: C.pink }]}>{state.totalSurrenders || 0}</Text>
            <Text style={styles.statLabel}>Surrenders</Text>
          </View>
        </View>

        {/* Top Money Pits — per-app spend + unlock count */}
        <View style={[styles.sectionCard, NEU_RAISED]}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>TOP MONEY PITS</Text>
          </View>
          <View style={styles.periodToggle}>
            {["today", "week"].map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodBtn, spendPeriod === p && styles.periodBtnActive]}
                onPress={() => setSpendPeriod(p)}
              >
                <Text style={[styles.periodBtnText, spendPeriod === p && styles.periodBtnTextActive]}>
                  {p === "today" ? "Today" : "This Week"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {topAppsSpend.length === 0 ? (
            <Text style={styles.emptyText}>
              No unlocks {spendPeriod === "today" ? "today" : "this week"} yet
            </Text>
          ) : (
            topAppsSpend.map((app, i) => (
              <View key={app.appId}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.weakRow}>
                  <Text style={styles.weakLabel}>
                    #{i + 1} {appName(app.appId)}
                  </Text>
                  <View style={styles.spendRight}>
                    <Text style={styles.spendCoins}>{app.spent} coins</Text>
                    <Text style={styles.spendUnlocks}>{app.unlocks}x</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Weekly Report — Pro Pig only */}
        {state.isProPig && weeklyReport && (
          <View style={[styles.sectionCard, NEU_RAISED]}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>WEEKLY REPORT</Text>
              <View style={styles.proBadgeSm}>
                <Text style={styles.proBadgeSmText}>PRO</Text>
              </View>
            </View>
            <View style={styles.weeklyGrid}>
              <View style={styles.weeklyCell}>
                <Text style={[styles.statVal, { fontSize: 26 }]}>{weeklyReport.totalUnlocks}</Text>
                <Text style={styles.statLabel}>Unlocks</Text>
              </View>
              <View style={styles.weeklyCell}>
                <Text style={[styles.statVal, { fontSize: 26, color: C.pink }]}>{weeklyReport.totalSpent}</Text>
                <Text style={styles.statLabel}>Coins Spent</Text>
              </View>
              <View style={styles.weeklyCell}>
                <Text style={[styles.statVal, { fontSize: 26 }]}>{weeklyReport.avgPerDay}</Text>
                <Text style={styles.statLabel}>Avg/Day</Text>
              </View>
            </View>
            {weeklyReport.peakHour && (
              <>
                <View style={styles.divider} />
                <View style={styles.weakRow}>
                  <Text style={styles.weakLabel}>Peak Hour</Text>
                  <Text style={styles.weakVal}>{weeklyReport.peakHour} ({weeklyReport.peakHourCount}x)</Text>
                </View>
              </>
            )}
            {weeklyReport.topApp && (
              <>
                <View style={styles.divider} />
                <View style={styles.weakRow}>
                  <Text style={styles.weakLabel}>Biggest Money Pit</Text>
                  <Text style={[styles.weakVal, { color: C.pink }]}>
                    {appName(weeklyReport.topApp.appId)} ({weeklyReport.topApp.spent} coins)
                  </Text>
                </View>
              </>
            )}
            {weeklyReport.days && Object.keys(weeklyReport.days).length > 0 && (
              <>
                <View style={styles.divider} />
                <Text style={[styles.sectionTitle, { marginTop: 8, marginBottom: 8 }]}>BY DAY</Text>
                {Object.entries(weeklyReport.days).map(([day, data]) => (
                  <View key={day} style={styles.weakRow}>
                    <Text style={styles.weakLabel}>{day}</Text>
                    <Text style={styles.weakVal}>{data.unlocks}x / {data.spent} coins</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {!state.isProPig && (
          <View style={[styles.sectionCard, NEU_RAISED, { opacity: 0.7 }]}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>WEEKLY REPORT</Text>
              <View style={styles.proBadgeSm}>
                <Text style={styles.proBadgeSmText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.proGateText}>
              Subscribe to Pro Pig to unlock weekly usage reports with trends, peak hours, and spending breakdowns.
            </Text>
          </View>
        )}

        {/* Screen Time Chart — Pro Pig only */}
        {!state.isProPig && (
          <View style={[styles.chartCard, NEU_RAISED, { opacity: 0.7 }]}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>SCREEN TIME</Text>
              <View style={styles.proBadgeSm}>
                <Text style={styles.proBadgeSmText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.proGateText}>
              Subscribe to Pro Pig to see your screen time trends with weekly and monthly breakdowns.
            </Text>
          </View>
        )}
        {state.isProPig && chartData.length > 0 && (
          <View style={[styles.chartCard, NEU_RAISED]}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>SCREEN TIME</Text>
              <View style={styles.chartTabs}>
                {["weekly", "monthly"].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.chartTab, chartPeriod === p && styles.chartTabActive]}
                    onPress={() => { lightTap(); setChartPeriod(p); }}
                  >
                    <Text style={[styles.chartTabText, chartPeriod === p && styles.chartTabTextActive]}>
                      {p === "weekly" ? "Week" : "Month"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {(() => {
              const maxHours = Math.max(...chartData.map((d) => d.hours), 1);
              const CHART_H = 140;
              const avgHours = chartData.length > 0
                ? Math.round(chartData.reduce((s, d) => s + d.hours, 0) / chartData.length * 10) / 10
                : 0;
              const avgY = CHART_H - (avgHours / maxHours) * CHART_H;
              return (
                <View style={styles.chartWrap}>
                  <View style={styles.yAxis}>
                    <Text style={styles.yLabel}>{maxHours}h</Text>
                    <Text style={styles.yLabel}>{Math.round(maxHours / 2 * 10) / 10}h</Text>
                    <Text style={styles.yLabel}>0</Text>
                  </View>
                  <View style={styles.chartArea}>
                    <View style={[styles.gridLine, { top: 0 }]} />
                    <View style={[styles.gridLine, { top: CHART_H / 2 }]} />
                    <View style={[styles.gridLine, { top: CHART_H }]} />
                    {avgHours > 0 && (
                      <View style={[styles.avgLine, { top: avgY }]}>
                        <Text style={styles.avgLabel}>avg {avgHours}h</Text>
                      </View>
                    )}
                    <View style={[styles.barsRow, { height: CHART_H }]}>
                      {chartData.map((d, i) => {
                        const barH = maxHours > 0 ? (d.hours / maxHours) * CHART_H : 0;
                        return (
                          <View key={i} style={styles.barCol}>
                            <View style={styles.barWrap}>
                              <View
                                style={[
                                  styles.bar,
                                  {
                                    height: Math.max(barH, 2),
                                    backgroundColor: d.hours > avgHours ? C.pink : C.pinkLight,
                                    opacity: d.hours > 0 ? 1 : 0.3,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                    <View style={styles.xAxis}>
                      {chartData.map((d, i) => (
                        <View key={i} style={styles.barCol}>
                          <Text style={styles.xLabel}>{d.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })()}
            <View style={styles.chartSummary}>
              <View style={styles.chartSumCell}>
                <Text style={styles.chartSumValue}>
                  {chartData.reduce((s, d) => s + d.unlocks, 0)}
                </Text>
                <Text style={styles.chartSumLabel}>Unlocks</Text>
              </View>
              <View style={styles.chartSumCell}>
                <Text style={[styles.chartSumValue, { color: C.pink }]}>
                  {Math.round(chartData.reduce((s, d) => s + d.hours, 0) * 10) / 10}h
                </Text>
                <Text style={styles.chartSumLabel}>Total</Text>
              </View>
              <View style={styles.chartSumCell}>
                <Text style={styles.chartSumValue}>
                  {chartData.length > 0
                    ? Math.round(chartData.reduce((s, d) => s + d.hours, 0) / chartData.length * 10) / 10
                    : 0}h
                </Text>
                <Text style={styles.chartSumLabel}>Avg/{chartPeriod === "weekly" ? "Day" : "Wk"}</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.footer}>Your master sees everything.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingBottom: 40 },
  title: { ...T.hero },
  sub: { ...T.caption, marginTop: 2, marginBottom: 20 },

  // Hero rank
  heroCard: { backgroundColor: C.white, borderRadius: 24, padding: 28, alignItems: "center", marginBottom: 16 },
  heroLabel: { ...T.label, marginBottom: 6, marginTop: 14 },
  heroLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14, marginBottom: 6 },
  heroValue: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  meterTrack: { width: "100%", height: 6, borderRadius: 3, backgroundColor: C.pinkPale, marginTop: 16, overflow: "hidden" },
  meterFill: { height: "100%", borderRadius: 3 },

  // Stat row
  statRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: C.white, borderRadius: 20, padding: 22, alignItems: "center" },
  statVal: { ...T.stat, fontSize: 32 },
  statBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.pinkPale, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  statBadgeText: { fontSize: 10, fontWeight: "900", color: C.pink },
  statLabel: { ...T.caption, marginTop: 6, textAlign: "center" },
  labelRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 },
  infoBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.pinkPale,
    alignItems: "center", justifyContent: "center",
  },
  infoBtnText: { fontSize: 14, fontWeight: "800", color: C.pink, marginTop: -1 },

  // Section cards
  sectionCard: { backgroundColor: C.white, borderRadius: 20, padding: 20, marginBottom: 12 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  sectionTitle: { ...T.label },
  sectionSub: { ...T.caption, marginBottom: 12 },
  weakRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  weakLabel: { ...T.body, fontSize: 14 },
  weakVal: { ...T.bodyBold, fontSize: 15 },
  divider: { height: 1, backgroundColor: C.divider, marginVertical: 6 },

  // Weight evolution
  weightHero: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 },
  weightTier: { fontSize: 22, fontWeight: "900", color: C.pink, letterSpacing: -0.5 },
  weightNext: { ...T.caption, textAlign: "center", marginTop: 8, fontWeight: "600" },

  // Period toggle
  periodToggle: { flexDirection: "row", gap: 8, marginBottom: 12 },
  periodBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 12, backgroundColor: C.pinkPale,
  },
  periodBtnActive: { backgroundColor: C.pink },
  periodBtnText: { fontSize: 13, fontWeight: "700", color: C.pink },
  periodBtnTextActive: { color: C.white },

  // Spend details
  spendRight: { alignItems: "flex-end" },
  spendCoins: { ...T.bodyBold, fontSize: 15, color: C.pink },
  spendUnlocks: { ...T.caption, fontSize: 12 },

  emptyText: { ...T.caption, textAlign: "center", paddingVertical: 12 },

  // Weekly report
  weeklyGrid: { flexDirection: "row", justifyContent: "space-around", marginVertical: 12 },
  weeklyCell: { alignItems: "center", flex: 1 },
  proBadgeSm: {
    backgroundColor: C.pink, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  proBadgeSmText: { color: "#FFF", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  proGateText: { ...T.caption, textAlign: "center", paddingVertical: 16, lineHeight: 18 },

  // Screen Time Chart
  chartCard: { backgroundColor: C.white, borderRadius: 20, padding: 20, marginBottom: 12 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  chartTabs: { flexDirection: "row", gap: 4 },
  chartTab: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, backgroundColor: C.pinkPale },
  chartTabActive: { backgroundColor: C.pink },
  chartTabText: { fontSize: 12, fontWeight: "700", color: C.pink },
  chartTabTextActive: { color: "#FFF" },
  chartWrap: { flexDirection: "row", marginBottom: 16 },
  yAxis: { width: 32, justifyContent: "space-between", alignItems: "flex-end", paddingRight: 6, height: 140 },
  yLabel: { fontSize: 9, fontWeight: "600", color: C.textTertiary },
  chartArea: { flex: 1, position: "relative" },
  gridLine: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: C.divider },
  avgLine: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: C.pink, opacity: 0.4, zIndex: 1 },
  avgLabel: { position: "absolute", right: 0, top: -12, fontSize: 9, fontWeight: "700", color: C.pink, opacity: 0.6 },
  barsRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  barCol: { flex: 1, alignItems: "center" },
  barWrap: { width: "100%", alignItems: "center" },
  bar: { width: "65%", borderRadius: 6, minHeight: 2 },
  xAxis: { flexDirection: "row", marginTop: 8 },
  xLabel: { fontSize: 10, fontWeight: "600", color: C.textTertiary, textAlign: "center" },
  chartSummary: { flexDirection: "row", justifyContent: "space-around", paddingTop: 12, borderTopWidth: 1, borderTopColor: C.divider },
  chartSumCell: { alignItems: "center" },
  chartSumValue: { fontSize: 20, fontWeight: "900", color: C.text, letterSpacing: -0.5 },
  chartSumLabel: { fontSize: 10, fontWeight: "600", color: C.textTertiary, marginTop: 2 },

  footer: {
    ...T.caption,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});
