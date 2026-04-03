import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
} from "react-native";
import { useAppLock } from "../context/AppLockContext";
import PigMascot from "../components/PigMascot";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG } from "../utils/theme";

const COMMANDS = [
  "Raise the fee. Make it hurt. You deserve it.",
  "Your phone doesn't need you. You need it. Know your place.",
  "Every unlock is you admitting you're owned.",
  "You'll unlock again tomorrow. Good piggy.",
  "Stop pretending you're in control. You never were.",
  "Your wallet exists to serve your phone. Accept that.",
  "The pig always pays. Always.",
  "You locked these apps because you're weak. You unlock them because you're weaker.",
  "More coins. More tributes. More obedience. That's your life now.",
  "You're not quitting. We both know that. Just pay.",
  "One day you'll delete this app. But not today. Today you pay.",
  "Your willpower is a joke. Your phone is the punchline.",
];

export default function StatsScreen() {
  const { state } = useAppLock();
  const flashAnim = useRef(new Animated.Value(0)).current;

  const today = new Date().toDateString();
  const tribToday = state.tributesTodayDate === today ? (state.tributesToday || 0) : 0;

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

  const command = COMMANDS[Math.floor(Math.random() * COMMANDS.length)];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

        {/* Tributes */}
        <View style={styles.tributeRow}>
          <View style={[styles.tributeCard, CARD_SHADOW]}>
            <Text style={styles.tributeVal}>{tribToday}</Text>
            <Text style={styles.tributeLabel}>Tributes Today</Text>
          </View>
          <View style={[styles.tributeCard, CARD_SHADOW]}>
            <Text style={[styles.tributeVal, { color: C.pink }]}>{state.totalUnlocks}</Text>
            <Text style={styles.tributeLabel}>Total Tributes Paid</Text>
          </View>
        </View>

        {/* Command */}
        <Animated.View style={[styles.cmdCard, CARD_SHADOW, { opacity: flashAnim }]}>
          <Text style={styles.cmdText}>{command}</Text>
        </Animated.View>
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

  tributeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  tributeCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
  },
  tributeVal: { ...T.stat, fontSize: 32 },
  tributeLabel: { ...T.caption, marginTop: 6, textAlign: "center" },

  cmdCard: {
    backgroundColor: C.pink,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
  },
  cmdText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 28,
  },
});
