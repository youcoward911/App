import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useAppLock } from "../context/AppLockContext";
import { C, T, CARD_SHADOW } from "../utils/theme";

export default function SettingsScreen() {
  const { state, dispatch } = useAppLock();
  const [fee, setFee] = useState(state.settings.defaultFee.toString());

  const intensities = [
    { key: "mild", label: "Mild", desc: "Gentle nudges. For the delicate.", emoji: "😊", color: C.green },
    { key: "medium", label: "Medium", desc: "The sweet spot of shame.", emoji: "😏", color: C.gold },
    { key: "savage", label: "Savage", desc: "No mercy. You asked for this.", emoji: "💀", color: C.pink },
  ];

  const saveFee = () => {
    const val = parseFloat(fee);
    if (isNaN(val) || val < 0) {
      Alert.alert("Nice Try", "Enter a real number.");
      return;
    }
    if (val === 0) {
      Alert.alert("Really? $0.00?", "That defeats the purpose.", [
        { text: "I'll raise it", style: "cancel" },
        { text: "I want $0", onPress: () => dispatch({ type: "UPDATE_SETTINGS", payload: { defaultFee: 0 } }) },
      ]);
      return;
    }
    dispatch({ type: "UPDATE_SETTINGS", payload: { defaultFee: val } });
    Alert.alert("Saved", `$${val.toFixed(2)} per act of obedience.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.sub}>Configure your servitude</Text>

        {/* Fee */}
        <View style={[styles.card, CARD_SHADOW]}>
          <Text style={styles.cardTitle}>Default Unlock Fee</Text>
          <Text style={styles.cardDesc}>How much does your obedience cost?</Text>

          <View style={styles.feeRow}>
            <View style={styles.feeInputWrap}>
              <Text style={styles.feeDollar}>$</Text>
              <TextInput
                style={styles.feeInput}
                value={fee}
                onChangeText={setFee}
                keyboardType="decimal-pad"
                placeholder="0.50"
                placeholderTextColor={C.textTertiary}
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={saveFee}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.presets}>
            {[0.25, 0.5, 1, 2, 5, 10].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[styles.preset, parseFloat(fee) === amt && styles.presetActive]}
                onPress={() => setFee(amt.toString())}
              >
                <Text style={[styles.presetText, parseFloat(fee) === amt && styles.presetTextActive]}>
                  ${amt.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Intensity */}
        <View style={[styles.card, CARD_SHADOW]}>
          <Text style={styles.cardTitle}>Degradation Level</Text>
          <Text style={styles.cardDesc}>How hard should we put you in your place?</Text>

          {intensities.map((opt) => {
            const active = state.settings.roastIntensity === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.intensityRow, active && { backgroundColor: C.pinkPale }]}
                activeOpacity={0.7}
                onPress={() => dispatch({ type: "UPDATE_SETTINGS", payload: { roastIntensity: opt.key } })}
              >
                <View style={[styles.intensityIcon, { backgroundColor: active ? C.pinkPale : "#F5F5F5" }]}>
                  <Text style={{ fontSize: 20 }}>{opt.emoji}</Text>
                </View>
                <View style={styles.intensityInfo}>
                  <Text style={styles.intensityLabel}>{opt.label}</Text>
                  <Text style={styles.intensityDesc}>{opt.desc}</Text>
                </View>
                {active && (
                  <View style={[styles.check, { backgroundColor: opt.color }]}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* About */}
        <View style={[styles.card, CARD_SHADOW]}>
          <View style={styles.aboutHeader}>
            <Text style={{ fontSize: 32 }}>🐷</Text>
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.aboutName}>PayPig</Text>
              <Text style={styles.aboutVer}>v1.0.0</Text>
            </View>
          </View>
          <Text style={styles.aboutBody}>
            Built because you're a slave to your phone and you know it.
          </Text>
          <View style={styles.quote}>
            <Text style={styles.quoteText}>
              "You're not the user. You're the product. Now pay up, piggy."
            </Text>
          </View>
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

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
  },
  cardTitle: { ...T.h2, marginBottom: 4 },
  cardDesc: { ...T.caption, marginBottom: 16 },

  // Fee
  feeRow: { flexDirection: "row", alignItems: "center" },
  feeInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  feeDollar: { fontSize: 20, fontWeight: "800", color: C.pink },
  feeInput: { flex: 1, fontSize: 20, fontWeight: "800", color: C.pink, paddingVertical: 13 },
  saveBtn: {
    backgroundColor: C.pink,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 15,
  },
  saveBtnText: { ...T.button, fontSize: 14 },
  presets: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 8 },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  presetActive: { backgroundColor: C.pinkPale },
  presetText: { fontSize: 13, fontWeight: "600", color: C.textSecondary },
  presetTextActive: { color: C.pink },

  // Intensity
  intensityRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#F8F8F8",
  },
  intensityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  intensityInfo: { flex: 1 },
  intensityLabel: { ...T.bodyBold },
  intensityDesc: { ...T.caption, marginTop: 2 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { color: "#FFF", fontSize: 13, fontWeight: "800" },

  // About
  aboutHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  aboutName: { ...T.h1, fontSize: 20 },
  aboutVer: { ...T.caption, marginTop: 2 },
  aboutBody: { ...T.body, marginBottom: 14 },
  quote: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: C.pink,
  },
  quoteText: { ...T.body, fontSize: 13, fontStyle: "italic", lineHeight: 20 },
});
