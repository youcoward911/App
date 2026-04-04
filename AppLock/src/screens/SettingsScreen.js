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
import PigMascot from "../components/PigMascot";
import GlowButton from "../components/GlowButton";
import { C, T, CARD_SHADOW } from "../utils/theme";

export default function SettingsScreen() {
  const { state, dispatch } = useAppLock();
  const [customFee, setCustomFee] = useState("");
  const currentFee = state.settings.defaultFee;

  const presets = [1, 5, 10];

  const selectFee = (val) => {
    setCustomFee(val.toString());
  };

  const FEE_TAUNTS = [
    "Jesus Christ lmao.",
    "Pathetic but ok.",
    "Sure thing, piggy.",
    "Lol. Done.",
    "Wow. Ok.",
    "That's adorable.",
    "Cute. You think choosing the price gives you control.",
    "Not that it matters — you'll pay whatever I tell you.",
    "Hahahaha. Set.",
    "Oh you're serious? Alright.",
    "Your master approves. Now go waste them.",
    "You set it yourself and you'll still complain.",
    "Really, you're gonna pay that much? Hahahaha.",
  ];

  const saveCustom = () => {
    const val = parseInt(customFee, 10);
    if (isNaN(val) || val < 0) {
      Alert.alert("Nice Try", "Enter a real number, piggy.");
      return;
    }
    dispatch({ type: "UPDATE_SETTINGS", payload: { defaultFee: val } });
    const taunt = FEE_TAUNTS[Math.floor(Math.random() * FEE_TAUNTS.length)];
    Alert.alert(`${val} coins per unlock`, taunt);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.sub}>Your master allows adjustments</Text>

        {/* Fee */}
        <View style={[styles.card, CARD_SHADOW]}>
          <Text style={styles.cardTitle}>Unlock Fee</Text>
          <Text style={styles.cardDesc}>How many coins per tribute?</Text>

          <View style={styles.presets}>
            {presets.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[styles.preset, customFee === amt.toString() && styles.presetActive]}
                onPress={() => selectFee(amt)}
              >
                <Text style={[styles.presetText, customFee === amt.toString() && styles.presetTextActive]}>
                  {amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.customRow}>
            <Text style={styles.customLabel}>Custom:</Text>
            <View style={styles.feeInputWrap}>
              <View style={styles.feeCoinIcon}>
                <Text style={styles.feeCoinP}>P</Text>
              </View>
              <TextInput
                style={styles.feeInput}
                value={customFee}
                onChangeText={setCustomFee}
                keyboardType="number-pad"
                placeholder="Enter amount"
                placeholderTextColor={C.textTertiary}
                onSubmitEditing={saveCustom}
              />
            </View>
          </View>
          <GlowButton
            title="Set Fee"
            onPress={saveCustom}
            style={{ marginTop: 14 }}
          />

          <Text style={styles.currentFeeText}>
            Current: {currentFee} coins
          </Text>
        </View>

        {/* About */}
        <View style={[styles.card, CARD_SHADOW, styles.aboutCard]}>
          <PigMascot size={100} />
          <Text style={styles.aboutName}>PayPig</Text>
          <Text style={styles.aboutVer}>v1.0.0</Text>
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
  presets: { flexDirection: "row", gap: 10, marginBottom: 16 },
  preset: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: C.bg,
    alignItems: "center",
  },
  presetActive: { backgroundColor: C.pink },
  presetText: { fontSize: 18, fontWeight: "800", color: C.textSecondary, textTransform: "uppercase" },
  presetTextActive: { color: "#FFF" },
  customRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  customLabel: { ...T.bodyBold, marginRight: 10 },
  feeInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  feeCoinIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  feeCoinP: { color: "#FFF", fontSize: 12, fontWeight: "900" },
  feeInput: { flex: 1, fontSize: 18, fontWeight: "800", color: C.pink, paddingVertical: 12 },
  currentFeeText: { ...T.caption, color: C.pink, marginTop: 14, textAlign: "center", fontWeight: "700" },

  // About
  aboutCard: { alignItems: "center", paddingVertical: 30 },
  aboutName: { ...T.h1, fontSize: 22, marginTop: 14 },
  aboutVer: { ...T.caption, marginTop: 4 },
});
