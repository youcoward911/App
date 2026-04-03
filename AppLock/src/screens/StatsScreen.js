import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { useAppLock } from "../context/AppLockContext";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG } from "../utils/theme";

const W = Dimensions.get("window").width;
const CARD_W = (W - 48 - 10) / 2;

export default function StatsScreen() {
  const { state } = useAppLock();
  const lockedCount = Object.keys(state.lockedApps).length;
  const avgFee =
    lockedCount > 0
      ? Object.values(state.lockedApps).reduce(
          (s, a) => s + (a.unlockFee || 0), 0
        ) / lockedCount
      : 0;

  const getShame = () => {
    if (state.totalUnlocks === 0)
      return { label: "Fresh Meat", emoji: "🤔", color: C.textTertiary };
    if (state.totalUnlocks < 5)
      return { label: "Piglet", emoji: "🐽", color: C.green };
    if (state.totalUnlocks < 15)
      return { label: "Obedient Pig", emoji: "🐷", color: C.gold };
    if (state.totalUnlocks < 30)
      return { label: "Phone Slave", emoji: "🐖", color: "#FF6B35" };
    return { label: "Full PayPig", emoji: "💀", color: C.pink };
  };

  const shame = getShame();
  const progress = Math.min((state.totalUnlocks / 30) * 100, 100);

  const getAnalysis = () => {
    if (state.totalUnlocks === 0)
      return "No unlocks yet. Enjoy the illusion of control while it lasts, piggy.";
    if (state.totalSpent < 5)
      return `$${state.totalSpent.toFixed(2)} paid in tribute. A small price for a small, weak person.`;
    if (state.totalSpent < 20)
      return `$${state.totalSpent.toFixed(2)} surrendered to a screen. You're not a user. You're livestock.`;
    return `$${state.totalSpent.toFixed(2)}. You've paid more to use your phone than most pay for therapy.`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Hall of Shame</Text>
        <Text style={styles.sub}>Your obedience, quantified</Text>

        {/* Shame Level */}
        <View style={[styles.heroCard, CARD_SHADOW_LG]}>
          <Text style={styles.heroEmoji}>{shame.emoji}</Text>
          <Text style={styles.heroLabel}>SHAME LEVEL</Text>
          <Text style={[styles.heroValue, { color: shame.color }]}>
            {shame.label}
          </Text>
          <View style={styles.meterTrack}>
            <View
              style={[
                styles.meterFill,
                { width: `${progress}%`, backgroundColor: shame.color },
              ]}
            />
          </View>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          <View style={[styles.gridCard, CARD_SHADOW]}>
            <Text style={styles.gridEmoji}>🔒</Text>
            <Text style={styles.gridVal}>{lockedCount}</Text>
            <Text style={styles.gridLabel}>Locked</Text>
          </View>
          <View style={[styles.gridCard, CARD_SHADOW]}>
            <Text style={styles.gridEmoji}>😩</Text>
            <Text style={styles.gridVal}>{state.totalUnlocks}</Text>
            <Text style={styles.gridLabel}>Obeyed</Text>
          </View>
          <View style={[styles.gridCard, CARD_SHADOW]}>
            <Text style={styles.gridEmoji}>💸</Text>
            <Text style={[styles.gridVal, { color: C.pink }]}>
              ${state.totalSpent.toFixed(2)}
            </Text>
            <Text style={styles.gridLabel}>Tribute</Text>
          </View>
          <View style={[styles.gridCard, CARD_SHADOW]}>
            <Text style={styles.gridEmoji}>💰</Text>
            <Text style={styles.gridVal}>${avgFee.toFixed(2)}</Text>
            <Text style={styles.gridLabel}>Avg Fee</Text>
          </View>
        </View>

        {/* Analysis */}
        <View style={[styles.analysisCard, CARD_SHADOW]}>
          <View style={styles.analysisDot} />
          <Text style={styles.analysisLabel}>ANALYSIS</Text>
          <Text style={styles.analysisBody}>{getAnalysis()}</Text>
        </View>

        {/* Commands */}
        <View style={[styles.cmdCard, CARD_SHADOW]}>
          <Text style={styles.cmdTitle}>Commands From Your Owner</Text>
          {[
            "Raise the fee. Make it hurt. You deserve it.",
            "Your phone doesn't need you. You need it. Know your place.",
            "Every unlock is you admitting you're owned.",
            "You'll unlock again tomorrow. Good piggy.",
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipArrow}>→</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingBottom: 40 },
  title: { ...T.hero },
  sub: { ...T.caption, marginTop: 2, marginBottom: 20 },

  heroCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 16,
  },
  heroEmoji: { fontSize: 52, marginBottom: 10 },
  heroLabel: { ...T.label, marginBottom: 6 },
  heroValue: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  meterTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: C.pinkPale,
    marginTop: 16,
    overflow: "hidden",
  },
  meterFill: { height: "100%", borderRadius: 3 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gridCard: {
    width: CARD_W,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    marginBottom: 10,
  },
  gridEmoji: { fontSize: 26, marginBottom: 8 },
  gridVal: { ...T.stat, fontSize: 24 },
  gridLabel: { ...T.caption, marginTop: 4 },

  analysisCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
  },
  analysisDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.pink,
    marginBottom: 10,
  },
  analysisLabel: { ...T.label, color: C.pink, marginBottom: 10 },
  analysisBody: { ...T.body, fontStyle: "italic", lineHeight: 24 },

  cmdCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 22,
  },
  cmdTitle: { ...T.h2, fontSize: 16, marginBottom: 14 },
  tipRow: { flexDirection: "row", marginBottom: 10 },
  tipArrow: { color: C.pink, fontWeight: "700", fontSize: 14, marginRight: 10, marginTop: 1 },
  tipText: { ...T.body, flex: 1, fontSize: 14 },
});
