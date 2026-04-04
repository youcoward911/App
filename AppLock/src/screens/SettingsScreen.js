import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Animated,
  Platform,
} from "react-native";
import { useAppLock } from "../context/AppLockContext";
import PigMascot from "../components/PigMascot";
import GlowButton from "../components/GlowButton";
import { C, T, CARD_SHADOW } from "../utils/theme";

const ITEM_H = 44;

export default function SettingsScreen() {
  const { state, dispatch } = useAppLock();
  const [customFee, setCustomFee] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [pickerHours, setPickerHours] = useState(0);
  const [pickerMins, setPickerMins] = useState(5);
  const currentFee = state.settings.defaultFee;
  const currentTimeLock = state.settings.timeLockMinutes || 0;

  const HOURS = Array.from({ length: 13 }, (_, i) => i); // 0-12
  const MINS = Array.from({ length: 60 }, (_, i) => i);  // 0-59

  const hourScrollRef = useRef(null);
  const minScrollRef = useRef(null);

  const openPicker = () => {
    const h = Math.floor(currentTimeLock / 60);
    const m = currentTimeLock % 60;
    setPickerHours(h);
    setPickerMins(m);
    setShowPicker(true);
    setTimeout(() => {
      hourScrollRef.current?.scrollTo({ y: h * ITEM_H, animated: false });
      minScrollRef.current?.scrollTo({ y: m * ITEM_H, animated: false });
    }, 100);
  };

  const savePicker = () => {
    const total = pickerHours * 60 + pickerMins;
    setShowPicker(false);
    dispatch({ type: "UPDATE_SETTINGS", payload: { timeLockMinutes: total } });
    if (total === 0) {
      Alert.alert("Time Lock Off", "No leash. Enjoy your freedom while it lasts.");
    } else {
      const label = pickerHours > 0 ? `${pickerHours}h ${pickerMins}m` : `${pickerMins}m`;
      const taunts = [
        `${label}? That's all you trust yourself with. Smart pig.`,
        `${label} of slop, then back in the pen. Deal.`,
        `Tick tock, piggy. ${label} and you're done.`,
        `Your master will drag you back in ${label}. Count on it.`,
      ];
      Alert.alert("Time Lock Set", taunts[Math.floor(Math.random() * taunts.length)]);
    }
    setCustomTime("");
  };

  const handleScrollEnd = (e, type) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_H);
    if (type === "hours") {
      const clamped = Math.max(0, Math.min(index, HOURS.length - 1));
      setPickerHours(clamped);
      hourScrollRef.current?.scrollTo({ y: clamped * ITEM_H, animated: true });
    } else {
      const clamped = Math.max(0, Math.min(index, MINS.length - 1));
      setPickerMins(clamped);
      minScrollRef.current?.scrollTo({ y: clamped * ITEM_H, animated: true });
    }
  };

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

        {/* Time Lock */}
        <View style={[styles.card, CARD_SHADOW]}>
          <Text style={styles.cardTitle}>Time Lock</Text>
          <Text style={styles.cardDesc}>
            {currentTimeLock > 0
              ? `Apps auto-relock after ${Math.floor(currentTimeLock / 60) > 0 ? Math.floor(currentTimeLock / 60) + "h " : ""}${currentTimeLock % 60}m`
              : "Apps stay unlocked until you relock them"}
          </Text>

          <View style={styles.presets}>
            {[0, 5, 15, 30, 60].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[styles.preset, customTime === mins.toString() && styles.presetActive]}
                onPress={() => setCustomTime(mins.toString())}
              >
                <Text style={[styles.presetText, styles.presetTextSm, customTime === mins.toString() && styles.presetTextActive]}>
                  {mins === 0 ? "Off" : `${mins}m`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.timeBtnRow}>
            <GlowButton
              title="Set Timer"
              onPress={() => {
                const val = parseInt(customTime, 10);
                if (isNaN(val) || val < 0) {
                  Alert.alert("Nice Try", "Pick a real number, piggy.");
                  return;
                }
                dispatch({ type: "UPDATE_SETTINGS", payload: { timeLockMinutes: val } });
                if (val === 0) {
                  Alert.alert("Time Lock Off", "No leash. Enjoy your freedom while it lasts.");
                } else {
                  const taunts = [
                    `${val} minutes? That's all you trust yourself with. Smart pig.`,
                    `${val} minutes of slop, then back in the pen. Deal.`,
                    `Tick tock, piggy. ${val} minutes and you're done.`,
                    `Your master will drag you back in ${val} minutes. Count on it.`,
                  ];
                  Alert.alert("Time Lock Set", taunts[Math.floor(Math.random() * taunts.length)]);
                }
                setCustomTime("");
              }}
              style={{ flex: 1, marginRight: 8, marginTop: 8 }}
            />
            <GlowButton
              title="Custom"
              ghost
              onPress={openPicker}
              style={{ flex: 1, marginLeft: 8, marginTop: 8 }}
            />
          </View>
        </View>

        {/* Scroll Wheel Picker Modal */}
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, CARD_SHADOW]}>
              <Text style={styles.modalTitle}>SET YOUR LEASH</Text>
              <Text style={styles.modalSub}>How long before your master drags you back?</Text>

              <View style={styles.pickerRow}>
                {/* Hours wheel */}
                <View style={styles.wheelCol}>
                  <Text style={styles.wheelLabel}>HOURS</Text>
                  <View style={styles.wheelContainer}>
                    <View style={styles.wheelHighlight} />
                    <ScrollView
                      ref={hourScrollRef}
                      style={styles.wheel}
                      contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_H}
                      decelerationRate="fast"
                      onMomentumScrollEnd={(e) => handleScrollEnd(e, "hours")}
                    >
                      {HOURS.map((h) => (
                        <View key={h} style={styles.wheelItem}>
                          <Text style={[styles.wheelItemText, pickerHours === h && styles.wheelItemTextActive]}>
                            {h}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <Text style={styles.wheelSeparator}>:</Text>

                {/* Minutes wheel */}
                <View style={styles.wheelCol}>
                  <Text style={styles.wheelLabel}>MIN</Text>
                  <View style={styles.wheelContainer}>
                    <View style={styles.wheelHighlight} />
                    <ScrollView
                      ref={minScrollRef}
                      style={styles.wheel}
                      contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_H}
                      decelerationRate="fast"
                      onMomentumScrollEnd={(e) => handleScrollEnd(e, "mins")}
                    >
                      {MINS.map((m) => (
                        <View key={m} style={styles.wheelItem}>
                          <Text style={[styles.wheelItemText, pickerMins === m && styles.wheelItemTextActive]}>
                            {String(m).padStart(2, "0")}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>

              <GlowButton title="Set Timer" onPress={savePicker} style={{ marginTop: 20 }} />
              <GlowButton title="Cancel" ghost onPress={() => setShowPicker(false)} style={{ marginTop: 10 }} />
            </View>
          </View>
        </Modal>

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
  currentFeeText: { ...T.caption, color: C.pink, marginTop: 14, textAlign: "center", fontWeight: "700" },

  // Time Lock
  timeBtnRow: { flexDirection: "row" },

  // Picker Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitle: { ...T.h2, textAlign: "center" },
  modalSub: { ...T.caption, textAlign: "center", marginTop: 4, marginBottom: 20 },
  pickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  wheelCol: { alignItems: "center" },
  wheelLabel: { ...T.label, marginBottom: 8 },
  wheelContainer: { height: ITEM_H * 5, width: 80, overflow: "hidden", position: "relative" },
  wheelHighlight: {
    position: "absolute", top: ITEM_H * 2, left: 0, right: 0, height: ITEM_H,
    backgroundColor: C.pinkPale, borderRadius: 10, zIndex: 0,
  },
  wheel: { flex: 1, zIndex: 1 },
  wheelItem: { height: ITEM_H, alignItems: "center", justifyContent: "center" },
  wheelItemText: { fontSize: 24, fontWeight: "300", color: C.textTertiary, letterSpacing: 1 },
  wheelItemTextActive: { fontSize: 28, fontWeight: "900", color: C.pink },
  wheelSeparator: { fontSize: 32, fontWeight: "900", color: C.pink, marginHorizontal: 16, marginTop: 24 },

  // About
  aboutCard: { alignItems: "center", paddingVertical: 30 },
  aboutName: { ...T.h1, fontSize: 22, marginTop: 14 },
  aboutVer: { ...T.caption, marginTop: 4 },
});
