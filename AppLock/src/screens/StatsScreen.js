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
import { getFullUsage, formatCaveTime } from "../utils/usageTracker";
import { getPigWeight, getWeightProgress, WEIGHT_TIERS } from "../utils/pigWeight";
import { C, T, NEU_RAISED } from "../utils/theme";

function appName(appId) {
  const app = POPULAR_APPS.find((a) => a.id === appId);
  return app ? app.name : appId;
}

export default function StatsScreen() {
  const { state } = useAppLock();
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    getFullUsage().then((data) => setUsage(data));
  }, [state.totalUnlocks]);

  const today = new Date().toDateString();
  const tribToday = state.tributesTodayDate === today ? (state.tributesToday || 0) : 0;

  const getShameRank = () => {
    if (state.totalUnlocks === 0)
      return { label: "Untrained", color: C.textTertiary };
    if (state.totalUnlocks < 5)
      return { label: "Rookie", color: C.green };
    if (state.totalUnlocks < 15)
      return { label: "Obedient Sow", color: C.gold };
    if (state.totalUnlocks < 30)
      return { label: "Trained", color: "#FF6B35" };
    return { label: "Master's Pet", color: C.pink };
  };

  const rank = getShameRank();
  const progress = Math.min((state.totalUnlocks / 30) * 100, 100);

  // Top 3 apps
  const appEntries = usage ? Object.entries(usage.appUnlocks || {}).sort((a, b) => b[1] - a[1]) : [];
  const topApps = appEntries.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Hall of Shame</Text>
        <Text style={styles.sub}>Your master keeps score</Text>

        {/* Pig Rank */}
        <View style={[styles.heroCard, NEU_RAISED]}>
          <PigMascot size={70} mood={state.totalUnlocks > 15 ? "happy" : "restless"} weight={getPigWeight(state.totalCoinsSpent).key} />
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

        {/* Pig Weight Evolution */}
        {(() => {
          const wt = getPigWeight(state.totalCoinsSpent);
          const wp = getWeightProgress(state.totalCoinsSpent);
          const wtIdx = WEIGHT_TIERS.findIndex((t) => t.key === wt.key);
          const nextTier = wtIdx >= 0 && wtIdx < WEIGHT_TIERS.length - 1 ? WEIGHT_TIERS[wtIdx + 1] : null;
          return (
            <View style={[styles.sectionCard, NEU_RAISED]}>
              <Text style={styles.sectionTitle}>PIG WEIGHT</Text>
              <Text style={styles.sectionSub}>Grows fatter with every coin spent</Text>
              <View style={styles.weightHero}>
                <Text style={styles.weightEmoji}>{wt.emoji}</Text>
                <Text style={styles.weightTier}>{wt.label}</Text>
              </View>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${wp * 100}%`, backgroundColor: C.pink }]} />
              </View>
              {nextTier ? (
                <Text style={styles.weightNext}>
                  Next: {nextTier.emoji} {nextTier.label} at {nextTier.minCoins} coins
                </Text>
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
            <Text style={styles.sectionTitle}>CAVE TIME</Text>
            <Text style={styles.sectionSub}>How fast you break</Text>
            <View style={styles.weakRow}>
              <Text style={styles.weakLabel}>Average Cave</Text>
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
            <Text style={styles.statEmoji}>🐽</Text>
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
  labelRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 },
  infoBtn: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: C.pinkPale,
    alignItems: "center", justifyContent: "center",
  },
  infoBtnText: { fontSize: 10, fontWeight: "800", color: C.pink },

  // Section cards
  sectionCard: { backgroundColor: C.white, borderRadius: 20, padding: 20, marginBottom: 12 },
  sectionTitle: { ...T.label, marginBottom: 4 },
  sectionSub: { ...T.caption, marginBottom: 12 },
  weakRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  weakLabel: { ...T.body, fontSize: 14 },
  weakVal: { ...T.bodyBold, fontSize: 15 },
  divider: { height: 1, backgroundColor: C.divider, marginVertical: 6 },

  // Weight evolution
  weightHero: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 },
  weightEmoji: { fontSize: 28 },
  weightTier: { fontSize: 22, fontWeight: "900", color: C.pink, letterSpacing: -0.5 },
  weightNext: { ...T.caption, textAlign: "center", marginTop: 8, fontWeight: "600" },

  footer: {
    ...T.caption,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});
