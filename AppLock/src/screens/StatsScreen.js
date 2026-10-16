import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "../context/AppLockContext";
import PigIdleWebView from "../components/PigIdleWebView";
import NeuBox from "../components/NeuBox";
import { getLevel, getNextLevel, getLevelProgress, getXPInLevel, getXPForLevel } from "../utils/pigWeight";
import { lightTap } from "../utils/haptics";
import { T } from "../utils/theme";
import ScreenTimeReport from "../components/ScreenTimeReport";

export default function StatsScreen({ navigation }) {
  const { state } = useAppLock();
  const xp = state.totalCoinsSpent;
  const level = getLevel(xp);
  const nextLevel = getNextLevel(xp);
  const xpProgress = getLevelProgress(xp);
  const xpInLevel = getXPInLevel(xp);
  const xpForLevel = getXPForLevel(xp);

  const stats = [
    { value: `${state.tributesToday || 0}`, label: "Tributes Today" },
    { value: `${state.totalUnlocks || 0}`, label: "Total Unlocks" },
    { value: `${state.totalSurrenders || 0}`, label: "Surrenders" },
    { value: `${state.ironSnoutStreak || 0}`, label: "Iron Snout Streak" },
    { value: `${state.bestIronSnout || 0}`, label: "Best Streak" },
    { value: `${state.totalPeeks || 0}`, label: "Total Peeks" },
  ];

  return (
    <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.title}>SHAME STATS</Text>

          {/* Hero Pig + Level */}
          <View style={styles.heroCard}>
            <Text style={styles.levelBadgeText}>Level {level.level}</Text>

            <PigIdleWebView
              level={Math.min(level.level, 5)}
              size={224}
              skin={state.activeSkin || "default"}
            />

            <Text style={styles.tierName}>{level.tier}</Text>

            <TouchableOpacity
              style={styles.lockerBtn}
              activeOpacity={0.8}
              onPress={() => { lightTap(); navigation.navigate("PigLocker"); }}
            >
              <Text style={styles.lockerBtnText}>Pig Locker</Text>
            </TouchableOpacity>
          </View>

          {/* XP Progress Bar */}
          <View style={styles.xpCard}>
            <View style={styles.xpLevelRow}>
              <Text style={styles.xpLevelText}>Lv.{level.level}</Text>
              <Text style={styles.xpAmountText}>{xpInLevel} / {xpForLevel || "MAX"}</Text>
              {nextLevel && <Text style={styles.xpLevelText}>Lv.{nextLevel.level}</Text>}
            </View>
            <View style={styles.xpBarTrack}>
              <LinearGradient
                colors={["#F7A0B2", "#F7A0B2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.xpBarFill, { width: `${Math.max(2, xpProgress * 100)}%` }]}
              />
            </View>
            <Text style={styles.xpRemaining}>
              {nextLevel
                ? `Spend ${nextLevel.xpRequired - xp} more coins to reach ${nextLevel.tier}`
                : "MAX LEVEL"}
            </Text>
          </View>

          {/* Screen Time Report */}
          <ScreenTimeReport style={{ marginBottom: 20 }} />

          {/* Stats Grid */}
          <Text style={styles.sectionLabel}>YOUR SHAME</Text>
          {Array.from({ length: Math.ceil(stats.length / 2) }, (_, row) => (
            <View key={row} style={styles.statsRow}>
              {stats.slice(row * 2, row * 2 + 2).map((s, i) => (
                <StatCard key={i} value={s.value} label={s.label} />
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function StatCard({ value, label }) {
  return (
    <NeuBox style={styles.statCard} borderRadius={16} bg="#FFFFFF" borderColor="rgba(255,255,255,0.9)">
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </NeuBox>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },

  title: { ...T.hero, color: "#F7A0B2", marginTop: 12, marginBottom: 8, textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },

  heroCard: { alignItems: "center", marginBottom: 16, overflow: "visible" },
  lockerBtn: { backgroundColor: "#F7A0B2", borderRadius: 16, paddingHorizontal: 28, paddingVertical: 12, marginTop: 10 },
  lockerBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.5 },
  levelBadgeGrad: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginBottom: 4 },
  levelBadgeText: { fontSize: 14, fontWeight: "900", color: "#2D2D2D", letterSpacing: 0.5, marginBottom: 4 },
  tierName: { fontSize: 22, fontWeight: "900", color: "#2D2D2D", letterSpacing: -0.5, marginTop: 8 },

  xpCard: { marginBottom: 16, padding: 18 },
  xpHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  xpLabel: { fontSize: 18, fontWeight: "500", color: "#2D2D2D", letterSpacing: -0.8, textTransform: "uppercase" },
  xpValue: { fontSize: 14, fontWeight: "900", color: "#2D2D2D" },
  xpLevelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  xpLevelText: { fontSize: 12, fontWeight: "700", color: "#F7A0B2" },
  xpAmountText: { fontSize: 11, fontWeight: "400", color: "#F7A0B2", letterSpacing: 1 },
  xpBarTrack: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,122,173,0.18)", overflow: "hidden", marginBottom: 8 },
  xpBarFill: { height: "100%", borderRadius: 4 },
  xpRemaining: { fontSize: 11, fontWeight: "500", color: "#F7A0B2", textAlign: "center" },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  statCard: { flex: 1, height: 90, alignItems: "center", justifyContent: "center", padding: 12 },
  statValue: { fontSize: 24, fontWeight: "900", color: "#2D2D2D", letterSpacing: -1 },
  statLabel: { fontSize: 10, fontWeight: "600", color: "#2D2D2D", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 4, textAlign: "center" },

  sectionLabel: { fontSize: 11, fontWeight: "800", color: "#2D2D2D", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 },
});
