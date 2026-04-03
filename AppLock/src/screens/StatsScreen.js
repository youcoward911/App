import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppLock } from "../context/AppLockContext";
import { COLORS, FONTS, SHADOW, GRADIENTS } from "../utils/theme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 24 * 2 - 12) / 2;

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
      return { label: "Untested", color: COLORS.textMuted, emoji: "🤔", bg: COLORS.bgElevated };
    if (state.totalUnlocks < 5)
      return { label: "Baby Pig", color: COLORS.mint, emoji: "🐽", bg: COLORS.mintSoft };
    if (state.totalUnlocks < 15)
      return { label: "Oink Oink", color: COLORS.gold, emoji: "🐷", bg: COLORS.goldSoft };
    if (state.totalUnlocks < 30)
      return { label: "Hog Wild", color: "#FF6B35", emoji: "🐖", bg: "rgba(255,107,53,0.12)" };
    return { label: "Full PayPig", color: COLORS.pink, emoji: "💸", bg: COLORS.pinkSoft };
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
      return `$${state.totalSpent.toFixed(2)}. Could've been a nice meal. Instead you bought the privilege of scrolling. Smart.`;
    }
    return `$${state.totalSpent.toFixed(2)}?! That's genuinely alarming. Talk to someone. Not me though, I'm just an app.`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Hall of Shame</Text>
        <Text style={styles.subtitle}>
          Your failures, beautifully quantified
        </Text>

        {/* Shame Level Hero Card */}
        <View style={styles.shameHero}>
          <LinearGradient
            colors={[shame.bg, COLORS.bgCard]}
            style={styles.shameHeroBg}
          />
          <Text style={styles.shameEmoji}>{shame.emoji}</Text>
          <Text style={styles.shameLevelLabel}>SHAME LEVEL</Text>
          <Text style={[styles.shameLevelValue, { color: shame.color }]}>
            {shame.label}
          </Text>
          <View style={styles.shameMeter}>
            <View style={styles.shameMeterTrack}>
              <LinearGradient
                colors={GRADIENTS.pink}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.shameMeterFill,
                  {
                    width: `${Math.min(
                      (state.totalUnlocks / 30) * 100,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderColor: COLORS.borderPink }]}>
            <LinearGradient
              colors={[COLORS.pinkSoft, "transparent"]}
              style={styles.statCardBg}
            />
            <Text style={styles.statEmoji}>🔒</Text>
            <Text style={styles.statValue}>{lockedCount}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
          <View style={[styles.statCard, { borderColor: COLORS.border }]}>
            <LinearGradient
              colors={[COLORS.purpleSoft, "transparent"]}
              style={styles.statCardBg}
            />
            <Text style={styles.statEmoji}>😩</Text>
            <Text style={styles.statValue}>{state.totalUnlocks}</Text>
            <Text style={styles.statLabel}>Caved</Text>
          </View>
          <View style={[styles.statCard, { borderColor: "rgba(255,214,102,0.2)" }]}>
            <LinearGradient
              colors={[COLORS.goldSoft, "transparent"]}
              style={styles.statCardBg}
            />
            <Text style={styles.statEmoji}>💸</Text>
            <Text style={[styles.statValue, { color: COLORS.gold }]}>
              ${state.totalSpent.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Burned</Text>
          </View>
          <View style={[styles.statCard, { borderColor: COLORS.border }]}>
            <LinearGradient
              colors={[COLORS.mintSoft, "transparent"]}
              style={styles.statCardBg}
            />
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={styles.statValue}>${avgFee.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Avg Fee</Text>
          </View>
        </View>

        {/* Analysis Card */}
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <View style={styles.analysisDot} />
            <Text style={styles.analysisTitle}>ANALYSIS</Text>
          </View>
          <Text style={styles.analysisBody}>{getRoastForStats()}</Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>"Helpful" Tips</Text>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>→</Text>
            <Text style={styles.tipText}>
              Set a higher fee. Nothing motivates like poverty.
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>→</Text>
            <Text style={styles.tipText}>
              When you feel the urge, go outside. Or don't. I'm not your
              therapist.
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>→</Text>
            <Text style={styles.tipText}>
              Every unlock is a choice. A bad one, but still a choice.
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Text style={styles.tipBullet}>→</Text>
            <Text style={styles.tipText}>
              Set the fee high enough to fund an actual therapist.
            </Text>
          </View>
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
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    ...FONTS.heroTitle,
    marginBottom: 4,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textMuted,
    marginBottom: 24,
  },

  // Shame Hero
  shameHero: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    ...SHADOW,
  },
  shameHeroBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  shameEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  shameLevelLabel: {
    ...FONTS.label,
    marginBottom: 6,
  },
  shameLevelValue: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  shameMeter: {
    width: "100%",
  },
  shameMeterTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.bgElevated,
    overflow: "hidden",
  },
  shameMeterFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
    ...SHADOW,
  },
  statCardBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  statEmoji: {
    fontSize: 26,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    ...FONTS.caption,
    marginTop: 4,
  },

  // Analysis
  analysisCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  analysisDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.pink,
    marginRight: 10,
  },
  analysisTitle: {
    ...FONTS.label,
    color: COLORS.pink,
  },
  analysisBody: {
    ...FONTS.body,
    fontStyle: "italic",
    lineHeight: 24,
  },

  // Tips
  tipsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipsTitle: {
    ...FONTS.subtitle,
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tipBullet: {
    color: COLORS.pink,
    fontWeight: "700",
    fontSize: 14,
    marginRight: 10,
    marginTop: 1,
  },
  tipText: {
    ...FONTS.body,
    flex: 1,
    fontSize: 14,
  },
});
