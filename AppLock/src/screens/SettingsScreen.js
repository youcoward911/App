import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock, FEE_TIERS } from "../context/AppLockContext";
import PigMascot from "../components/PigMascot";
import GlowButton from "../components/GlowButton";
import { C, T, CARD_SHADOW } from "../utils/theme";

export default function SettingsScreen() {
  const { state, dispatch } = useAppLock();
  const [customFee, setCustomFee] = useState("");

  const FEE_TAUNTS = [
    "Jesus Christ lmao.",
    "Pathetic but ok.",
    "Sure thing.",
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
    if (isNaN(val) || val < 1) {
      Alert.alert("Nice Try", "Enter a real number.");
      return;
    }
    dispatch({ type: "UPDATE_SETTINGS", payload: { defaultPeekFee: val, defaultFullFee: val * 10 } });
    const taunt = FEE_TAUNTS[Math.floor(Math.random() * FEE_TAUNTS.length)];
    Alert.alert(`${val} peek / ${val * 10} full unlock`, taunt);
    setCustomFee("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.sub}>Your master allows adjustments</Text>

        {/* Peek / Unlock Fee */}
        <View style={[styles.card, CARD_SHADOW]}>
          <View style={styles.feeTitleRow}>
            <Text style={styles.cardTitle}>Peek / Unlock Cost</Text>
            <TouchableOpacity
              style={styles.feeInfoBtn}
              onPress={() => Alert.alert(
                "Peek vs Full Unlock",
                "Peek lets you use an app for 3 minutes before re-locking. Peeks double for each use during the same lock session.\n\nFull unlocks cost 10x your set peek price.",
                [{ text: "Got it" }]
              )}
            >
              <Text style={styles.feeInfoBtnText}>?</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardDesc}>
            Current: {state.settings.defaultPeekFee} peek / {state.settings.defaultFullFee} full unlock
          </Text>

          <View style={styles.presets}>
            {FEE_TIERS.map((t) => {
              const isActive = state.settings.defaultPeekFee === t.peek && state.settings.defaultFullFee === t.full;
              return (
                <TouchableOpacity
                  key={t.label}
                  style={[styles.preset, isActive && styles.presetActive]}
                  onPress={() => {
                    dispatch({ type: "UPDATE_SETTINGS", payload: { defaultPeekFee: t.peek, defaultFullFee: t.full } });
                    const taunt = FEE_TAUNTS[Math.floor(Math.random() * FEE_TAUNTS.length)];
                    Alert.alert(`${t.peek} peek / ${t.full} full`, taunt);
                  }}
                >
                  <Text style={[styles.presetText, isActive && styles.presetTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.customRow}>
            <Text style={styles.customLabel}>Custom peek:</Text>
            <View style={styles.feeInputWrap}>
              <View style={styles.feeCoinIcon}>
                <Text style={styles.feeCoinP}>P</Text>
              </View>
              <TextInput
                style={styles.feeInput}
                value={customFee}
                onChangeText={setCustomFee}
                keyboardType="number-pad"
                placeholder="Peek cost"
                placeholderTextColor={C.textTertiary}
                onSubmitEditing={saveCustom}
              />
            </View>
          </View>
          <Text style={styles.feeHint}>Full unlock = 10x peek cost</Text>
          <GlowButton
            title="Set Custom Fee"
            onPress={saveCustom}
            style={{ marginTop: 14 }}
          />
        </View>


        {/* About */}
        <View style={[styles.card, CARD_SHADOW, styles.aboutCard]}>
          <PigMascot size={100} />
          <Text style={styles.aboutName}>Scroll Pig</Text>
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
  presetTextSm: { fontSize: 14 },
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
  feeTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  feeInfoBtn: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.pinkPale,
    alignItems: "center", justifyContent: "center",
  },
  feeInfoBtnText: { fontSize: 13, fontWeight: "800", color: C.pink, marginTop: -1 },
  feeHint: { ...T.caption, color: C.textTertiary, marginTop: 8, textAlign: "center" },

  // About
  aboutCard: { alignItems: "center", paddingVertical: 30 },
  aboutName: { ...T.h1, fontSize: 22, marginTop: 14 },
  aboutVer: { ...T.caption, marginTop: 4 },
});
