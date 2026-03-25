import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useAppLock } from "../context/AppLockContext";
import { COLORS, FONTS } from "../utils/theme";

export default function StatsScreen() {
  const { state } = useAppLock();

  const lockedCount = Object.keys(state.lockedApps).length;
  const avgFee =
    lockedCount > 0
      ? Object.values(state.lockedApps).reduce(
          (sum, a) => sum + (a.unlockFee || 0),
          0
        ) / lockedCount
      : 0;

  const getShameLevel = () => {
    if (state.totalUnlocks === 0)
      return { label: "Untested", color: COLORS.textMuted, emoji: "🤔" };
    if (state.totalUnlocks < 5)
      return { label: "Rookie Addict", color: COLORS.success, emoji: "🌱" };
    if (state.totalUnlocks < 15)
      return {
        label: "Casual Catastrophe",
        color: COLORS.warning,
        emoji: "🫠",
      };
    if (state.totalUnlocks < 30)
      return {
        label: "Professional Failure",
        color: "#FF6B35",
        emoji: "🔥",
      };
    return {
      label: "Hopeless Case",
      color: COLORS.accent,
      emoji: "💀",
    };
  };

  const shame = getShameLevel();

  const getRoastForStats = () => {
    if (state.totalUnlocks === 0) {
      return "No unlocks yet. Either you're a saint or you just installed this. We'll see how long that lasts.";
    }
    if (state.totalSpent === 0) {
      return "You've unlocked apps but spent $0? Are you gaming the system or just broke?";
    }
    if (state.totalSpent < 5) {
      return `$${state.totalSpent.toFixed(2)} wasted on dopamine. That's like ${Math.ceil(state.totalSpent / 1.5)} coffees you didn't get to have.`;
    }
    if (state.totalSpent < 20) {
      return `$${state.totalSpent.toFixed(2)}. You could've bought a nice lunch. Instead you bought the privilege of scrolling. Good choices.`;
    }
    return `$${state.totalSpent.toFixed(2)}?! That's genuinely concerning. Please talk to someone. Not me though, I'm an app.`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Hall of Shame</Text>
        <Text style={styles.subtitle}>
          Your failures, quantified for your displeasure
        </Text>

        {/* Shame Level */}
        <View style={styles.shameLevelCard}>
          <Text style={styles.shameEmoji}>{shame.emoji}</Text>
          <Text style={styles.shameLevelLabel}>Current Shame Level</Text>
          <Text style={[styles.shameLevelValue, { color: shame.color }]}>
            {shame.label}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔒</Text>
            <Text style={styles.statValue}>{lockedCount}</Text>
            <Text style={styles.statLabel}>Apps Locked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>😩</Text>
            <Text style={styles.statValue}>{state.totalUnlocks}</Text>
            <Text style={styles.statLabel}>Times Caved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💸</Text>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>
              ${state.totalSpent.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Money Burned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={styles.statValue}>${avgFee.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Avg Fee</Text>
          </View>
        </View>

        {/* Roast Card */}
        <View style={styles.roastCard}>
          <Text style={styles.roastTitle}>📊 Analysis</Text>
          <Text style={styles.roastBody}>{getRoastForStats()}</Text>
        </View>

        {/* Tips (backhanded) */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 "Helpful" Tips</Text>
          <Text style={styles.tip}>
            • Try setting a higher fee. Nothing motivates like poverty.
          </Text>
          <Text style={styles.tip}>
            • When you feel the urge, go outside. Or don't. I'm not your
            therapist.
          </Text>
          <Text style={styles.tip}>
            • Remember: every unlock is a choice. A bad choice, but still a
            choice.
          </Text>
          <Text style={styles.tip}>
            • If you can't beat the addiction, at least set the fee high enough
            to fund a real therapist.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    ...FONTS.title,
    fontSize: 32,
  },
  subtitle: {
    ...FONTS.body,
    marginTop: 4,
    marginBottom: 20,
  },
  shameLevelCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  shameEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  shameLevelLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  shameLevelValue: {
    fontSize: 24,
    fontWeight: "900",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    width: "48%",
    alignItems: "center",
    marginBottom: 12,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  roastCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  roastTitle: {
    ...FONTS.subtitle,
    marginBottom: 8,
  },
  roastBody: {
    ...FONTS.body,
    lineHeight: 22,
    fontStyle: "italic",
  },
  tipsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    ...FONTS.subtitle,
    marginBottom: 12,
  },
  tip: {
    ...FONTS.body,
    lineHeight: 22,
    marginBottom: 8,
  },
});
