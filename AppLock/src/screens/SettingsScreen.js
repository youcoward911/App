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
import { COLORS, FONTS } from "../utils/theme";

export default function SettingsScreen() {
  const { state, dispatch } = useAppLock();
  const [defaultFee, setDefaultFee] = useState(
    state.settings.defaultFee.toString()
  );

  const intensityOptions = [
    {
      key: "mild",
      label: "Mild",
      desc: "Gentle nudges. For the sensitive types.",
      emoji: "😊",
    },
    {
      key: "medium",
      label: "Medium",
      desc: "Solid roasts. The sweet spot of shame.",
      emoji: "😏",
    },
    {
      key: "savage",
      label: "Savage",
      desc: "No mercy. You asked for this.",
      emoji: "💀",
    },
  ];

  const saveFee = () => {
    const fee = parseFloat(defaultFee);
    if (isNaN(fee) || fee < 0) {
      Alert.alert("Nice Try", "Enter a real number. Preferably one that hurts.");
      return;
    }
    if (fee === 0) {
      Alert.alert(
        "Really? $0.00?",
        "That defeats the entire purpose. But sure, it's your life.",
        [
          { text: "Fine, I'll raise it", style: "cancel" },
          {
            text: "I want $0",
            onPress: () =>
              dispatch({
                type: "UPDATE_SETTINGS",
                payload: { defaultFee: 0 },
              }),
          },
        ]
      );
      return;
    }
    dispatch({ type: "UPDATE_SETTINGS", payload: { defaultFee: fee } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Configure your suffering experience
        </Text>

        {/* Default Fee */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Unlock Fee</Text>
          <Text style={styles.sectionDesc}>
            How much should it cost you every time you're weak?
          </Text>
          <View style={styles.feeRow}>
            <View style={styles.feeInputContainer}>
              <Text style={styles.feeCurrency}>$</Text>
              <TextInput
                style={styles.feeInput}
                value={defaultFee}
                onChangeText={setDefaultFee}
                keyboardType="decimal-pad"
                placeholder="0.50"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={saveFee}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.presets}>
            {[0.25, 0.5, 1.0, 2.0, 5.0].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.presetChip}
                onPress={() => setDefaultFee(amount.toString())}
              >
                <Text style={styles.presetText}>${amount.toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Roast Intensity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Roast Intensity</Text>
          <Text style={styles.sectionDesc}>
            How hard do you want to be roasted?
          </Text>
          {intensityOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.intensityOption,
                state.settings.roastIntensity === option.key &&
                  styles.intensityOptionActive,
              ]}
              onPress={() =>
                dispatch({
                  type: "UPDATE_SETTINGS",
                  payload: { roastIntensity: option.key },
                })
              }
            >
              <Text style={styles.intensityEmoji}>{option.emoji}</Text>
              <View style={styles.intensityInfo}>
                <Text style={styles.intensityLabel}>{option.label}</Text>
                <Text style={styles.intensityDesc}>{option.desc}</Text>
              </View>
              {state.settings.roastIntensity === option.key && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            AppLock was built because you apparently can't be trusted with your
            own phone. You're welcome.
          </Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.tagline}>
            "Because apparently you need an app to tell you to stop using apps"
          </Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    ...FONTS.title,
    fontSize: 32,
  },
  subtitle: {
    ...FONTS.body,
    marginTop: 4,
    marginBottom: 20,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.subtitle,
    marginBottom: 4,
  },
  sectionDesc: {
    ...FONTS.body,
    fontSize: 13,
    marginBottom: 16,
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  feeInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  feeCurrency: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.warning,
    marginRight: 4,
  },
  feeInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.warning,
    paddingVertical: 12,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: COLORS.text,
    fontWeight: "700",
  },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  presetChip: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
    fontSize: 13,
  },
  intensityOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  intensityOptionActive: {
    borderColor: COLORS.accent,
  },
  intensityEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  intensityInfo: {
    flex: 1,
  },
  intensityLabel: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 15,
  },
  intensityDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  checkmark: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: "800",
  },
  aboutText: {
    ...FONTS.body,
    lineHeight: 22,
    marginBottom: 12,
  },
  version: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: "italic",
  },
});
