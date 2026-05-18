import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C } from "../utils/theme";
import GlowButton from "../components/GlowButton";
import PigMascot from "../components/PigMascot";
import { requestAuthorization, isScreenTimeAvailable, showAppPicker } from "../native/ScreenTime";
import { useAppLock } from "../context/AppLockContext";

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const { dispatch } = useAppLock();

  const handleGrant = async () => {
    if (isScreenTimeAvailable()) {
      try {
        await requestAuthorization();
      } catch (e) {}
    }
    setStep(2);
  };

  const handleAddSlop = async () => {
    if (isScreenTimeAvailable()) {
      try {
        const result = await showAppPicker();
        if (result.selectedCount > 0) {
          dispatch({ type: "SET_APP_COUNT", payload: { count: result.selectedCount } });
          onComplete();
          return;
        }
      } catch (e) {}
    }
    // If not available (Expo Go) or no apps selected, complete anyway
    onComplete();
  };

  if (step === 1) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.spacer} />
          <PigMascot size={120} />
          <Text style={styles.title}>Hi Piggy!</Text>
          <Text style={styles.message}>
            Grant me access to your{"\n"}screen time controls.
          </Text>
          <Text style={styles.warning}>
            I'm not gonna ask twice.
          </Text>
          <View style={styles.spacer} />
          <View style={styles.buttons}>
            <GlowButton title="Grant Access" onPress={handleGrant} />
            <Text style={styles.privacy}>
              Your data stays on your device. Always.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.spacer} />
        <PigMascot size={120} />
        <Text style={styles.title}>Very good.</Text>
        <Text style={styles.message}>
          Already following directions. Now let me know which apps you'd like to add to your Slop Lock.
        </Text>
        <View style={styles.spacer} />
        <View style={styles.buttons}>
          <GlowButton title="Add Slop" onPress={handleAddSlop} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingBottom: 40,
    alignItems: "center",
  },
  spacer: { flex: 1 },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#000",
    textAlign: "center",
    letterSpacing: -1,
    marginTop: 28,
  },
  message: {
    fontSize: 20,
    fontWeight: "600",
    color: C.text,
    textAlign: "center",
    lineHeight: 28,
    marginTop: 16,
  },
  warning: {
    fontSize: 16,
    fontWeight: "800",
    color: C.pink,
    textAlign: "center",
    marginTop: 12,
  },
  buttons: {
    width: "100%",
    marginBottom: 12,
  },
  privacy: {
    fontSize: 12,
    fontWeight: "400",
    color: C.textTertiary,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
});
