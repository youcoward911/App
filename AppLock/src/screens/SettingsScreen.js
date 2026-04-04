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
import { C, T, CARD_SHADOW } from "../utils/theme";

export default function SettingsScreen() {
  const { state, dispatch } = useAppLock();
  const [customFee, setCustomFee] = useState("");
  const currentFee = state.settings.defaultFee;

  const presets = [1, 5, 10];

  const selectFee = (val) => {
    setCustomFee("");
    dispatch({ type: "UPDATE_SETTINGS", payload: { defaultFee: val } });
  };

  const saveCustom = () => {
    const val = parseInt(customFee, 10);
    if (isNaN(val) || val < 0) {
      Alert.alert("Nice Try", "Enter a real number, piggy.");
      return;
    }
    dispatch({ type: "UPDATE_SETTINGS", payload: { defaultFee: val } });
    Alert.alert("Saved", `${val} coins per act of obedience.`);
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
                style={[styles.preset, currentFee === amt && !customFee && styles.presetActive]}
                onPress={() => selectFee(amt)}
              >
                <Text style={[styles.presetText, currentFee === amt && !customFee && styles.presetTextActive]}>
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
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={saveCustom}>
              <Text style={styles.saveBtnText}>Set</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.currentFeeText}>
            Current: {currentFee} coins
          </Text>
        </View>

        {/* About */}
        <View style={[styles.card, CARD_SHADOW]}>
          <View style={styles.aboutHeader}>
            <PigMascot size={48} animate={false} />
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.aboutName}>PayPig</Text>
              <Text style={styles.aboutVer}>v1.0.0</Text>
            </View>
          </View>
          <Text style={styles.aboutBody}>
            Your master built this to keep you in line. Oink.
          </Text>
          <View style={styles.quote}>
            <Text style={styles.quoteText}>
              "You're not a user. You're a pig. And pigs pay their master."
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
  saveBtn: {
    backgroundColor: C.pink,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  saveBtnText: { ...T.button, fontSize: 13 },
  currentFeeText: { ...T.caption, color: C.pink, marginTop: 14, textAlign: "center", fontWeight: "700" },

  // About
  aboutHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  aboutName: { ...T.h1, fontSize: 20 },
  aboutVer: { ...T.caption, marginTop: 2 },
  aboutBody: { ...T.body, marginBottom: 14 },
  quote: {
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: C.pink,
  },
  quoteText: { ...T.body, fontSize: 13, fontStyle: "italic", lineHeight: 20 },
});
