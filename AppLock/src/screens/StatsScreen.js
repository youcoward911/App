import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "../context/AppLockContext";
import PigMascot from "../components/PigMascot";
import { POPULAR_APPS } from "../data/defaultApps";
import { getFullUsage, formatCaveTime } from "../utils/usageTracker";
import { getRandomShame } from "../data/shameMessages";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG, NEU_RAISED } from "../utils/theme";

function appName(appId) {
  const app = POPULAR_APPS.find((a) => a.id === appId);
  return app ? app.name : appId;
}

export default function StatsScreen() {
  const { state } = useAppLock();
  const [usage, setUsage] = useState(null);
  const [shame, setShame] = useState(null);

  useEffect(() => {
    getFullUsage().then((data) => {
      setUsage(data);
      const msg = getRandomShame(data);
      if (msg) setShame(msg);
    });
  }, [state.totalUnlocks]);

  const today = new Date().toDateString();
  const tribToday = state.tributesTodayDate === today ? (state.tributesToday || 0) : 0;

  const getShameRank = () => {
    if (state.totalUnlocks === 0)
      return { label: "Untrained Pig", color: C.textTertiary };
    if (state.totalUnlocks < 5)
      return { label: "Piglet", color: C.green };
    if (state.totalUnlocks < 15)
      return { label: "Obedient Sow", color: C.gold };
    if (state.totalUnlocks < 30)
      return { label: "Trained Pay Pig", color: "#FF6B35" };
    return { label: "Master's Pet", color: C.pink };
  };

  const rank = getShameRank();
  const progress = Math.min((state.totalUnlocks / 30) * 100, 100);

  // Weakest app
  const appEntries = usage ? Object.entries(usage.appUnlocks || {}).sort((a, b) => b[1] - a[1]) : [];
  const weakestApp = appEntries.length > 0 ? { name: appName(appEntries[0][0]), count: appEntries[0][1] } : null;

  // Peak hour
  let peakHourDisplay = null;
  if (usage) {
    const hourEntries = Object.entries(usage.hourlyUnlocks || {}).sort((a, b) => b[1] - a[1]);
    if (hourEntries.length > 0) {
      const h = parseInt(hourEntries[0][0]);
      const period = h >= 12 ? "PM" : "AM";
      const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
      peakHourDisplay = { text: `${display} ${period}`, count: hourEntries[0][1] };
    }
  }

  // Weakest day
  let weakestDay = null;
  if (usage) {
    const dayEntries = Object.entries(usage.dailyUnlocks || {}).sort((a, b) => b[1] - a[1]);
    if (dayEntries.length > 0) {
      weakestDay = { day: dayEntries[0][0], count: dayEntries[0][1] };
    }
  }

  // Top 3 apps
  const topApps = appEntries.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Hall of Shame</Text>
        <Text style={styles.sub}>Your master keeps score</Text>

        {/* Shame message */}
        {shame && (
          <View style={[styles.shameCard, NEU_RAISED]}>
            <Text style={styles.shameText}>{shame}</Text>
          </View>
        )}

        {/* Pig Rank */}
        <View style={[styles.heroCard, NEU_RAISED]}>
          <PigMascot size={70} mood={state.totalUnlocks > 15 ? "happy" : "restless"} />
          <Text style={styles.heroLabel}>PIG RANK</Text>
          <Text style={[styles.heroValue, { color: rank.color }]}>
            {rank.label}
          </Text>
          <View style={styles.meterTrack}>
            <View
              style={[styles.meterFill, { width: `${progress}%`, backgroundColor: rank.color }]}
            />
          </View>
        </View>

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

        {/* Weakness section */}
        {(weakestApp || peakHourDisplay || weakestDay) && (
          <View style={[styles.sectionCard, NEU_RAISED]}>
            <Text style={styles.sectionTitle}>YOUR WEAKNESSES</Text>

            {weakestApp && (
              <View style={styles.weakRow}>
                <Text style={styles.weakLabel}>Weakest App</Text>
                <Text style={styles.weakVal}>{weakestApp.name} ({weakestApp.count}x)</Text>
              </View>
            )}
            {peakHourDisplay && (
              <>
                <View style={styles.divider} />
                <View style={styles.weakRow}>
                  <Text style={styles.weakLabel}>Peak Shame Hour</Text>
                  <Text style={styles.weakVal}>{peakHourDisplay.text}</Text>
                </View>
              </>
            )}
            {weakestDay && (
              <>
                <View style={styles.divider} />
                <View style={styles.weakRow}>
                  <Text style={styles.weakLabel}>Weakest Day</Text>
                  <Text style={styles.weakVal}>{weakestDay.day}s ({weakestDay.count}x)</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Cave times */}
        {usage && (usage.fastestCave !== Infinity || usage.averageCaveTime > 0) && (
          <View style={[styles.sectionCard, NEU_RAISED]}>
            <Text style={styles.sectionTitle}>CAVE TIMES</Text>
            <Text style={styles.sectionSub}>How fast you break</Text>

            {usage.fastestCave !== Infinity && (
              <View style={styles.weakRow}>
                <Text style={styles.weakLabel}>Fastest Cave</Text>
                <Text style={[styles.weakVal, { color: C.pink }]}>{formatCaveTime(usage.fastestCave)}</Text>
              </View>
            )}
            {usage.averageCaveTime > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.weakRow}>
                  <Text style={styles.weakLabel}>Average Cave</Text>
                  <Text style={styles.weakVal}>{formatCaveTime(usage.averageCaveTime)}</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Streak */}
        {usage && (usage.streakDays > 0 || usage.longestStreak > 0) && (
          <View style={styles.statRow}>
            <View style={[styles.statCard, NEU_RAISED]}>
              <Text style={[styles.statVal, { color: "#FF6B35" }]}>{usage.streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
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
            <Text style={styles.statEmoji}>🐽</Text>
            <Text style={[styles.statVal, { color: "#FF6B35" }]}>{state.ironSnoutStreak || 0}</Text>
            <Text style={styles.statLabel}>Iron Snout</Text>
          </View>
          <View style={[styles.statCard, NEU_RAISED]}>
            <Text style={styles.statVal}>{state.bestIronSnout || 0}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
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

        {/* Top apps leaderboard */}
        {topApps.length > 1 && (
          <View style={[styles.sectionCard, NEU_RAISED]}>
            <Text style={styles.sectionTitle}>MOST UNLOCKED</Text>
            {topApps.map(([id, count], i) => (
              <View key={id}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.weakRow}>
                  <Text style={styles.weakLabel}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {appName(id)}
                  </Text>
                  <Text style={styles.weakVal}>{count}x</Text>
                </View>
              </View>
            ))}
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

  // Shame message
  shameCard: {
    backgroundColor: "#FFF0F5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: C.pink,
  },
  shameText: {
    fontSize: 15,
    fontWeight: "700",
    fontStyle: "italic",
    color: C.pink,
    lineHeight: 22,
  },

  // Hero rank
  heroCard: { backgroundColor: C.white, borderRadius: 24, padding: 28, alignItems: "center", marginBottom: 16 },
  heroLabel: { ...T.label, marginBottom: 6, marginTop: 14 },
  heroValue: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  meterTrack: { width: "100%", height: 6, borderRadius: 3, backgroundColor: C.pinkPale, marginTop: 16, overflow: "hidden" },
  meterFill: { height: "100%", borderRadius: 3 },

  // Stat row
  statRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: C.white, borderRadius: 20, padding: 22, alignItems: "center" },
  statVal: { ...T.stat, fontSize: 32 },
  statEmoji: { fontSize: 20, marginBottom: 2 },
  statLabel: { ...T.caption, marginTop: 6, textAlign: "center" },

  // Section cards
  sectionCard: { backgroundColor: C.white, borderRadius: 20, padding: 20, marginBottom: 12 },
  sectionTitle: { ...T.label, marginBottom: 4 },
  sectionSub: { ...T.caption, marginBottom: 12 },
  weakRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  weakLabel: { ...T.body, fontSize: 14 },
  weakVal: { ...T.bodyBold, fontSize: 15 },
  divider: { height: 1, backgroundColor: C.divider, marginVertical: 6 },

  footer: {
    ...T.caption,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});
