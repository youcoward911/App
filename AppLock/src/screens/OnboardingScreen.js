import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C } from "../utils/theme";
import GlowButton from "../components/GlowButton";
import PigMascot from "../components/PigMascot";
import { requestAuthorization, isScreenTimeAvailable } from "../native/ScreenTime";

const { width: SCREEN_W } = Dimensions.get("window");

export default function OnboardingScreen({ onComplete }) {
  const handleContinue = async () => {
    if (isScreenTimeAvailable()) {
      try {
        await requestAuthorization();
      } catch (e) {}
    }
    onComplete();
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <PigMascot size={80} />
          <Text style={styles.title}>
            Connect Scroll Pig{"\n"}to Screen Time.
          </Text>
          <Text style={styles.subtitle}>
            To actually block your apps, Scroll Pig needs Screen Time access on this iPhone.
          </Text>
        </View>

        {/* Permission preview card */}
        <View style={styles.previewCard}>
          <View style={styles.previewInner}>
            <Text style={styles.previewTitle}>
              "Scroll Pig" Would Like to{"\n"}Access Screen Time
            </Text>
            <Text style={styles.previewBody}>
              Providing "Scroll Pig" access to Screen Time may allow it to see your activity data, restrict content, and limit the usage of apps and websites.
            </Text>
            <View style={styles.previewBtns}>
              <View style={styles.previewBtn}>
                <Text style={styles.previewBtnText}>Continue</Text>
              </View>
              <View style={styles.previewBtn}>
                <Text style={styles.previewBtnText}>Don't Allow</Text>
              </View>
            </View>
          </View>
          {/* Arrow */}
          <Text style={styles.arrow}>↑</Text>
          <Text style={styles.arrowHint}>Tap "Continue" when this appears</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <GlowButton title="Connect Screen Time" onPress={handleContinue} />
          <GlowButton title="Skip for Now" ghost onPress={handleSkip} />
          <Text style={styles.privacy}>
            Your data is processed on-device and never leaves your phone.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40 },

  header: { alignItems: "center", marginBottom: 28, marginTop: 40 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
    textAlign: "center",
    letterSpacing: -1,
    marginTop: 20,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 12,
    paddingHorizontal: 10,
  },

  // Permission preview
  previewCard: {
    alignItems: "center",
    marginTop: 8,
  },
  previewInner: {
    width: SCREEN_W - 80,
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 22,
    borderWidth: 1.5,
    borderColor: C.pink,
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 10,
    lineHeight: 22,
  },
  previewBody: {
    fontSize: 12,
    fontWeight: "400",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 18,
    marginBottom: 18,
  },
  previewBtns: {
    flexDirection: "row",
    gap: 10,
  },
  previewBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  previewBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  arrow: {
    fontSize: 28,
    color: C.pink,
    marginTop: 12,
    fontWeight: "300",
  },
  arrowHint: {
    fontSize: 13,
    fontWeight: "500",
    color: C.pink,
    marginTop: 4,
  },

  buttons: { marginTop: 28, marginBottom: 12 },

  privacy: {
    fontSize: 12,
    fontWeight: "400",
    color: C.textTertiary,
    textAlign: "center",
    lineHeight: 18,
  },
});
