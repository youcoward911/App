import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  InputAccessoryView,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock, FEE_TIERS } from "../context/AppLockContext";
import PigIdleWebView from "../components/PigIdleWebView";
import GlowButton from "../components/GlowButton";
import { showAlert } from "../components/CustomAlert";
import { C, T, CARD_SHADOW } from "../utils/theme";
import { signInWithApple, isAppleAuthAvailable, getAppleLinkedStatus } from "../utils/appleAuth";

export default function SettingsScreen({ navigation }) {
  const { state, dispatch } = useAppLock();
  const [customFee, setCustomFee] = useState("");
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [appleLinked, setAppleLinked] = useState(false);

  useEffect(() => {
    if (Platform.OS === "ios") {
      isAppleAuthAvailable().then(setAppleAvailable).catch(() => {});
      setAppleLinked(getAppleLinkedStatus());
    }
  }, []);

  const handleAppleSignIn = async () => {
    try {
      const result = await signInWithApple();
      if (result.success) {
        setAppleLinked(true);
        if (result.restoredData) {
          dispatch({ type: "LOAD_STATE", payload: result.restoredData });
          showAlert("Account Restored", "Your progress has been restored from your Apple account.");
        } else {
          showAlert("Linked", "Your progress is now backed up to your Apple account.");
        }
      }
    } catch (e) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        showAlert("Error", e.message || "Sign in failed");
      }
    }
  };

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
      showAlert("Nice Try", "Enter a real number.");
      return;
    }
    dispatch({ type: "UPDATE_SETTINGS", payload: { defaultPeekFee: val, defaultFullFee: val } });
    const taunt = FEE_TAUNTS[Math.floor(Math.random() * FEE_TAUNTS.length)];
    showAlert(`${val} coins to unlock`, taunt);
    setCustomFee("");
  };

  return (
    <>
    <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={styles.gradient}>
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* Unlock Fee */}
        <View style={[styles.card, CARD_SHADOW]}>
          <Text style={styles.cardTitle}>
            {state.isProPig ? "Peek / Unlock Cost" : "Unlock Cost"}
          </Text>
          <Text style={styles.cardDesc}>
            {state.isProPig
              ? `Current: ${state.settings.defaultPeekFee} peek / ${state.settings.defaultFullFee} unlock`
              : `Current: ${state.settings.defaultFullFee} coins to unlock`}
          </Text>

          <View style={styles.presets}>
            {FEE_TIERS.map((t) => {
              const isActive = state.settings.defaultFullFee === t.full;
              return (
                <TouchableOpacity
                  key={t.label}
                  style={[styles.preset, isActive && styles.presetActive]}
                  onPress={() => {
                    dispatch({ type: "UPDATE_SETTINGS", payload: { defaultPeekFee: t.peek, defaultFullFee: t.full } });
                    const taunt = FEE_TAUNTS[Math.floor(Math.random() * FEE_TAUNTS.length)];
                    showAlert(
                      state.isProPig ? `${t.peek} peek / ${t.full} unlock` : `${t.full} coins to unlock`,
                      taunt
                    );
                  }}
                >
                  <Text style={[styles.presetText, isActive && styles.presetTextActive]}>
                    {state.isProPig ? t.label : t.full}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.customRow}>
            <Text style={styles.customLabel}>{state.isProPig ? "Custom peek:" : "Custom:"}</Text>
            <View style={styles.feeInputWrap}>
              <View style={styles.feeCoinIcon}>
                <Text style={styles.feeCoinP}>P</Text>
              </View>
              <TextInput
                style={styles.feeInput}
                value={customFee}
                onChangeText={setCustomFee}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="rgba(45,45,45,0.3)"
                inputAccessoryViewID="feeDone"
                onSubmitEditing={saveCustom}
              />
            </View>
          </View>
          {state.isProPig && (
            <Text style={styles.feeHint}>Unlock = 10x peek cost</Text>
          )}
          <GlowButton
            title="Set Custom Fee"
            onPress={saveCustom}
            style={{ marginTop: 14 }}
          />
        </View>


        {/* Sign in with Apple */}
        {Platform.OS === "ios" && appleAvailable && (
          <View style={[styles.card, CARD_SHADOW]}>
            <Text style={styles.cardTitle}>Account Backup</Text>
            <Text style={styles.cardDesc}>
              {appleLinked
                ? "Your progress is backed up via Apple"
                : "Link your Apple account to restore progress on a new device"}
            </Text>
            {appleLinked ? (
              <View style={styles.appleLinkedRow}>
                <Text style={styles.appleLinkedText}>Signed in with Apple</Text>
              </View>
            ) : (
              <GlowButton
                title=" Sign in with Apple"
                onPress={handleAppleSignIn}
                style={{ backgroundColor: "transparent", borderWidth: 1.5, borderColor: "#F7A0B2" }}
              />
            )}
          </View>
        )}

        {/* Dev Mode */}
        <View style={[styles.card, CARD_SHADOW]}>
          <Text style={styles.cardTitle}>Dev Mode</Text>
          <Text style={styles.cardDesc}>Testing tools</Text>
          <View style={{ gap: 8 }}>
            <TouchableOpacity style={styles.devBtn} onPress={() => { dispatch({ type: "ADD_COINS", payload: { coins: 100 } }); showAlert("Added", "+100 coins"); }}>
              <Text style={styles.devBtnText}>+100 Coins</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devBtn} onPress={() => { dispatch({ type: "ADD_COINS", payload: { coins: 500 } }); showAlert("Added", "+500 coins"); }}>
              <Text style={styles.devBtnText}>+500 Coins</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.devBtn} onPress={() => {
              // Simulate spending coins to trigger level ups
              dispatch({ type: "PAY_TRIBUTE", payload: { fee: 50 } });
              showAlert("Tribute", "Spent 50 coins (XP +50)");
            }}>
              <Text style={styles.devBtnText}>Spend 50 Coins (Fake Tribute)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.devBtn, state.isProPig && { borderWidth: 1.5, borderColor: "#F7A0B2" }]} onPress={() => {
              if (state.isProPig) {
                dispatch({ type: "DEACTIVATE_PRO_PIG" });
                showAlert("Pro Pig", "Deactivated");
              } else {
                dispatch({ type: "ACTIVATE_PRO_PIG" });
                showAlert("Pro Pig", "Activated");
              }
            }}>
              <Text style={[styles.devBtnText, state.isProPig && { color: "#FFF" }]}>
                {state.isProPig ? "Pro Pig: ON (tap to disable)" : "Pro Pig: OFF (tap to enable)"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={[styles.card, CARD_SHADOW, styles.aboutCard]}>
          <PigIdleWebView size={100} />
          <Text style={styles.aboutName}>Scroll Pig</Text>
          <Text style={styles.aboutVer}>v1.0.5</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
    {Platform.OS === "ios" && (
      <InputAccessoryView nativeID="feeDone">
        <View style={styles.kbToolbar}>
          <TouchableOpacity onPress={() => { saveCustom(); Keyboard.dismiss(); }}>
            <Text style={styles.kbDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 },
  title: { ...T.hero, color: "#F7A0B2", marginTop: 0, marginBottom: 16, textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },
  sub: { ...T.caption, marginTop: 2, marginBottom: 20 },

  card: {
    backgroundColor: C.bg,
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#F7A0B2", textTransform: "uppercase", marginBottom: 4 },
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
  presetActive: { borderWidth: 1.5, borderColor: "#F7A0B2" },
  presetText: { fontSize: 18, fontWeight: "500", color: "#2D2D2D", textTransform: "uppercase" },
  presetTextActive: { color: "#2D2D2D", fontWeight: "700" },
  presetTextSm: { fontSize: 14 },
  customRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  customLabel: { ...T.bodyBold, fontWeight: "500", marginRight: 10 },
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
    borderWidth: 1.5,
    borderColor: "#F7A0B2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  feeCoinP: { color: "#F7A0B2", fontSize: 12, fontWeight: "900" },
  feeInput: { flex: 1, fontSize: 18, fontWeight: "800", color: "#F7A0B2", paddingVertical: 12 },
  feeTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  feeInfoBtn: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1, borderColor: "#F7A0B2",
    alignItems: "center", justifyContent: "center",
  },
  feeInfoBtnText: { fontSize: 13, fontWeight: "500", color: "#2D2D2D", marginTop: -1 },
  feeHint: { ...T.caption, color: "#2D2D2D", marginTop: 8, textAlign: "center" },

  // Dev
  devBtn: {
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  devBtnText: { fontSize: 13, fontWeight: "500", color: "#2D2D2D" },

  // Apple
  appleLinkedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
  },
  appleLinkedText: { fontSize: 14, fontWeight: "700", color: "#2E7D32" },

  // About
  aboutCard: { alignItems: "center", paddingVertical: 30 },
  aboutName: { ...T.h1, fontSize: 22, marginTop: 14 },
  aboutVer: { ...T.caption, marginTop: 4 },

  // Keyboard toolbar
  kbToolbar: { backgroundColor: "#F0F0F0", paddingHorizontal: 16, paddingVertical: 10, alignItems: "flex-end" },
  kbDoneText: { fontSize: 16, fontWeight: "600", color: "#F7A0B2" },
});
