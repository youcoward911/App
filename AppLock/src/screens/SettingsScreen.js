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
import { LinearGradient } from "expo-linear-gradient";
import { useAppLock } from "../context/AppLockContext";
import { COLORS, FONTS, SHADOW, GRADIENTS } from "../utils/theme";

export default function SettingsScreen() {
  const { state, dispatch } = useAppLock();
  const [defaultFee, setDefaultFee] = useState(
    state.settings.defaultFee.toString()
  );

  const intensityOptions = [
    {
      key: "mild",
      label: "Mild",
      desc: "Gentle nudges. For the delicate.",
      emoji: "😊",
      color: COLORS.mint,
      bg: COLORS.mintSoft,
    },
    {
      key: "medium",
      label: "Medium",
      desc: "The sweet spot of shame.",
      emoji: "😏",
      color: COLORS.gold,
      bg: COLORS.goldSoft,
    },
    {
      key: "savage",
      label: "Savage",
      desc: "No mercy. You asked for this.",
      emoji: "💀",
      color: COLORS.pink,
      bg: COLORS.pinkSoft,
    },
  ];

  const saveFee = () => {
    const fee = parseFloat(defaultFee);
    if (isNaN(fee) || fee < 0) {
      Alert.alert(
        "Nice Try",
        "Enter a real number. Preferably one that hurts."
      );
      return;
    }
    if (fee === 0) {
      Alert.alert(
        "Really? $0.00?",
        "That defeats the entire purpose. But sure, it's your life.",
        [
          { text: "I'll raise it", style: "cancel" },
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
    Alert.alert("Saved", `$${fee.toFixed(2)} per act of obedience. Good piggy.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your servitude</Text>

        {/* Default Fee */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Unlock Fee</Text>
          <Text style={styles.sectionDesc}>
            How much does your obedience cost?
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
                placeholderTextColor={COLORS.textDim}
              />
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.8}
              onPress={saveFee}
            >
              <LinearGradient
                colors={GRADIENTS.pink}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonInner}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.presets}>
            {[0.25, 0.5, 1.0, 2.0, 5.0, 10.0].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.presetChip,
                  parseFloat(defaultFee) === amount && styles.presetChipActive,
                ]}
                activeOpacity={0.7}
                onPress={() => setDefaultFee(amount.toString())}
              >
                <Text
                  style={[
                    styles.presetText,
                    parseFloat(defaultFee) === amount &&
                      styles.presetTextActive,
                  ]}
                >
                  ${amount.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Roast Intensity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Degradation Level</Text>
          <Text style={styles.sectionDesc}>How hard do you want to be put in your place?</Text>
          {intensityOptions.map((option) => {
            const isActive = state.settings.roastIntensity === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.intensityOption,
                  isActive && {
                    borderColor: option.color,
                    backgroundColor: option.bg,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  dispatch({
                    type: "UPDATE_SETTINGS",
                    payload: { roastIntensity: option.key },
                  })
                }
              >
                <View
                  style={[
                    styles.intensityEmojiContainer,
                    { backgroundColor: isActive ? option.bg : COLORS.bgElevated },
                  ]}
                >
                  <Text style={styles.intensityEmoji}>{option.emoji}</Text>
                </View>
                <View style={styles.intensityInfo}>
                  <Text style={styles.intensityLabel}>{option.label}</Text>
                  <Text style={styles.intensityDesc}>{option.desc}</Text>
                </View>
                {isActive && (
                  <View
                    style={[
                      styles.checkBadge,
                      { backgroundColor: option.color },
                    ]}
                  >
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.aboutHeader}>
            <Text style={styles.aboutPig}>🐷</Text>
            <View>
              <Text style={styles.aboutName}>PayPig</Text>
              <Text style={styles.version}>v1.0.0</Text>
            </View>
          </View>
          <Text style={styles.aboutText}>
            Built because you're a slave to your phone and you know it.
            This app doesn't help you. It owns you.
          </Text>
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>
              "You're not the user. You're the product. Now pay up, piggy."
            </Text>
          </View>
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
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    ...FONTS.heroTitle,
    marginBottom: 4,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  section: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW,
  },
  sectionTitle: {
    ...FONTS.subtitle,
    marginBottom: 4,
  },
  sectionDesc: {
    ...FONTS.caption,
    marginBottom: 18,
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  feeInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgInput,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
  },
  feeCurrency: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.gold,
    marginRight: 4,
  },
  feeInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.gold,
    paddingVertical: 14,
  },
  saveButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  saveButtonInner: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveButtonText: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 15,
  },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    gap: 8,
  },
  presetChip: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldSoft,
  },
  presetText: {
    color: COLORS.textMuted,
    fontWeight: "700",
    fontSize: 13,
  },
  presetTextActive: {
    color: COLORS.gold,
  },
  intensityOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgElevated,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  intensityEmojiContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  intensityEmoji: {
    fontSize: 22,
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
    ...FONTS.caption,
    marginTop: 2,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  aboutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  aboutPig: {
    fontSize: 38,
    marginRight: 14,
  },
  aboutName: {
    ...FONTS.title,
    fontSize: 22,
  },
  version: {
    ...FONTS.caption,
    marginTop: 2,
  },
  aboutText: {
    ...FONTS.body,
    marginBottom: 16,
  },
  taglineContainer: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.pink,
  },
  tagline: {
    ...FONTS.body,
    fontSize: 13,
    fontStyle: "italic",
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});
