import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ScrollView,
} from "react-native";
import { useAppLock } from "../context/AppLockContext";
import { POPULAR_APPS } from "../data/defaultApps";
import {
  getRoastMessage,
  getPrePaymentTaunt,
  getPostUnlockShade,
} from "../data/roastMessages";
import { COLORS, FONTS } from "../utils/theme";

export default function UnlockScreen({ route, navigation }) {
  const { appId } = route.params;
  const { state, dispatch } = useAppLock();
  const lockInfo = state.lockedApps[appId];
  const appInfo = POPULAR_APPS.find((a) => a.id === appId);

  const [phase, setPhase] = useState("roast"); // 'roast' | 'confirm' | 'unlocked'
  const [roasts, setRoasts] = useState([]);
  const [currentRoastIndex, setCurrentRoastIndex] = useState(0);
  const [preTaunt, setPreTaunt] = useState("");
  const [postShade, setPostShade] = useState("");
  const [showingRoast, setShowingRoast] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!lockInfo?.lockedAt) {
      // Already unlocked, show relock option
      setPhase("unlocked");
      setPostShade(getPostUnlockShade());
      return;
    }

    const minutesSinceLock = (Date.now() - lockInfo.lockedAt) / 60000;
    const unlockCount = lockInfo.unlockCountToday || 0;
    const messages = getRoastMessage(minutesSinceLock, unlockCount + 1);
    setRoasts(messages);
    setPreTaunt(getPrePaymentTaunt());

    // Fade in first roast
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Cycle through roasts
  useEffect(() => {
    if (phase !== "roast" || roasts.length === 0) return;

    const timer = setInterval(() => {
      setCurrentRoastIndex((prev) => {
        if (prev < roasts.length - 1) {
          // Fade transition
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();
          return prev + 1;
        }
        setShowingRoast(false);
        clearInterval(timer);
        return prev;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [phase, roasts]);

  const handlePayToUnlock = () => {
    // Shake the fee amount for dramatic effect
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    setPhase("confirm");
  };

  const handleConfirmUnlock = () => {
    dispatch({ type: "UNLOCK_APP", payload: { appId } });
    setPostShade(getPostUnlockShade());
    setPhase("unlocked");
  };

  const handleRelock = () => {
    dispatch({ type: "RELOCK_APP", payload: { appId } });
    navigation.goBack();
  };

  if (!appInfo || !lockInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>App not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info */}
        <Text style={styles.appIcon}>{appInfo.icon}</Text>
        <Text style={styles.appName}>{appInfo.name}</Text>

        {phase === "roast" && (
          <View style={styles.roastSection}>
            <Animated.Text style={[styles.roastText, { opacity: fadeAnim }]}>
              {roasts[currentRoastIndex] || "..."}
            </Animated.Text>

            {!showingRoast && (
              <View style={styles.unlockSection}>
                <Text style={styles.preTaunt}>{preTaunt}</Text>

                <Animated.View
                  style={[
                    styles.feeDisplay,
                    { transform: [{ translateX: shakeAnim }] },
                  ]}
                >
                  <Text style={styles.feeLabel}>Unlock Fee</Text>
                  <Text style={styles.feeAmount}>
                    ${lockInfo.unlockFee?.toFixed(2)}
                  </Text>
                  <Text style={styles.feeSubtext}>
                    (You chose this amount. Remember that? When you had hope?)
                  </Text>
                </Animated.View>

                <TouchableOpacity
                  style={styles.payButton}
                  onPress={handlePayToUnlock}
                >
                  <Text style={styles.payButtonText}>
                    Fine, Take My Money 💸
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resistButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.resistButtonText}>
                    Actually, I Have Self Control
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {phase === "confirm" && (
          <View style={styles.confirmSection}>
            <Text style={styles.confirmTitle}>Are you sure?</Text>
            <Text style={styles.confirmText}>
              You're about to pay ${lockInfo.unlockFee?.toFixed(2)} because you
              can't go without {appInfo.name}.
            </Text>
            <Text style={styles.confirmSubtext}>
              That's ${lockInfo.unlockFee?.toFixed(2)} you'll never get back.
              For what? Memes? Reels? Validation from strangers?
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmUnlock}
            >
              <Text style={styles.confirmButtonText}>
                I Accept My Weakness 😔
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.neverMindButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.neverMindText}>
                Wait No, I'm Better Than This
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === "unlocked" && (
          <View style={styles.unlockedSection}>
            <Text style={styles.unlockedIcon}>🔓</Text>
            <Text style={styles.unlockedTitle}>Unlocked</Text>
            <Text style={styles.postShade}>{postShade}</Text>

            <View style={styles.shameStats}>
              <Text style={styles.shameTitle}>Your Shame Stats</Text>
              <Text style={styles.shameStat}>
                Total spent: ${state.totalSpent.toFixed(2)}
              </Text>
              <Text style={styles.shameStat}>
                Times you've caved: {state.totalUnlocks}
              </Text>
              <Text style={styles.shameStat}>
                Today's unlocks for this app:{" "}
                {lockInfo.unlockCountToday || 0}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.relockButton}
              onPress={handleRelock}
            >
              <Text style={styles.relockButtonText}>
                Lock It Again (Try Harder This Time)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.goBackButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.goBackText}>Go Wallow in Shame</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: 18,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  appIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  appName: {
    ...FONTS.title,
    marginBottom: 30,
  },
  errorText: {
    ...FONTS.body,
    textAlign: "center",
    marginTop: 100,
  },

  // Roast Phase
  roastSection: {
    alignItems: "center",
    width: "100%",
  },
  roastText: {
    ...FONTS.roast,
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 30,
    minHeight: 70,
  },
  unlockSection: {
    alignItems: "center",
    width: "100%",
  },
  preTaunt: {
    ...FONTS.body,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 24,
    fontSize: 16,
  },
  feeDisplay: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  feeLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  feeAmount: {
    ...FONTS.fee,
  },
  feeSubtext: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  payButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  payButtonText: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 17,
  },
  resistButton: {
    paddingVertical: 14,
  },
  resistButtonText: {
    color: COLORS.success,
    fontWeight: "600",
    fontSize: 15,
  },

  // Confirm Phase
  confirmSection: {
    alignItems: "center",
    width: "100%",
  },
  confirmTitle: {
    ...FONTS.title,
    color: COLORS.accent,
    marginBottom: 16,
  },
  confirmText: {
    ...FONTS.body,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  confirmSubtext: {
    color: COLORS.textMuted,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
    marginBottom: 32,
  },
  confirmButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  confirmButtonText: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 17,
  },
  neverMindButton: {
    paddingVertical: 14,
  },
  neverMindText: {
    color: COLORS.success,
    fontWeight: "600",
    fontSize: 15,
  },

  // Unlocked Phase
  unlockedSection: {
    alignItems: "center",
    width: "100%",
  },
  unlockedIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  unlockedTitle: {
    ...FONTS.title,
    color: COLORS.success,
    marginBottom: 12,
  },
  postShade: {
    ...FONTS.roast,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
  },
  shameStats: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 24,
  },
  shameTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  shameStat: {
    ...FONTS.body,
    fontSize: 14,
    marginBottom: 6,
  },
  relockButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  relockButtonText: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 15,
  },
  goBackButton: {
    paddingVertical: 14,
  },
  goBackText: {
    color: COLORS.textMuted,
    fontWeight: "600",
    fontSize: 15,
  },
});
