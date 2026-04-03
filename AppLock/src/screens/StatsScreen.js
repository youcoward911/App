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
import PigMascot from "../components/PigMascot";
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
      return { label: "Fresh Meat", color: C.textTertiary };
    if (state.totalUnlocks < 5)
      return { label: "Piglet", color: C.green };
    if (state.totalUnlocks < 15)
      return { label: "Obedient Pig", color: C.gold };
    if (state.totalUnlocks < 30)
      return { label: "Phone Slave", color: "#FF6B35" };
    return { label: "Full PayPig", color: C.pink };
  };

  const shame = getShame();
  const progress = Math.min((state.totalUnlocks / 30) * 100, 100);

  const getAnalysis = () => {
    if (state.totalUnlocks === 0)
      return "No unlocks yet. Enjoy the illusion of control while it lasts, piggy.";
    if (state.totalCoinsSpent < 20)
      return `${state.totalCoinsSpent} coins surrendered. Barely a nibble. You'll be hemorrhaging coins in no time.`;
    if (state.totalCoinsSpent < 100)
      return `${state.totalCoinsSpent} coins burned through. You're not a user. You're livestock.`;
    return `${state.totalCoinsSpent} coins gone. You've fed more to this app than most people spend on food.`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Hall of Shame</Text>
        <Text style={styles.sub}>Your obedience, quantified</Text>

        {/* Shame Level */}
        <View style={[styles.heroCard, CARD_SHADOW_LG]}>
          <PigMascot size={70} />
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
            <View style={[styles.gridDot, { backgroundColor: C.pink }]} />
            <Text style={styles.gridVal}>{lockedCount}</Text>
            <Text style={styles.gridLabel}>Locked</Text>
          </View>
          <View style={[styles.gridCard, CARD_SHADOW]}>
            <View style={[styles.gridDot, { backgroundColor: C.gold }]} />
            <Text style={styles.gridVal}>{state.totalUnlocks}</Text>
            <Text style={styles.gridLabel}>Obeyed</Text>
          </View>
          <View style={[styles.gridCard, CARD_SHADOW]}>
            <View style={[styles.gridDot, { backgroundColor: C.green }]} />
            <Text style={[styles.gridVal, { color: C.pink }]}>
              {state.totalCoinsSpent}
            </Text>
            <Text style={styles.gridLabel}>Coins Spent</Text>
          </View>
          <View style={[styles.gridCard, CARD_SHADOW]}>
            <View style={[styles.gridDot, { backgroundColor: "#FF6B35" }]} />
            <Text style={styles.gridVal}>{Math.round(avgFee)}</Text>
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
              <Text style={styles.tipArrow}>-</Text>
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
  heroLabel: { ...T.label, marginBottom: 6, marginTop: 14 },
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
  gridDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
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
