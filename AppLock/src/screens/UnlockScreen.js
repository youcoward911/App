import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppLock } from "../context/AppLockContext";
import { POPULAR_APPS } from "../data/defaultApps";
import {
  getRoastMessage,
  getPrePaymentTaunt,
  getPostUnlockShade,
} from "../data/roastMessages";
import { COLORS, FONTS, SHADOW, SHADOW_PINK, GRADIENTS } from "../utils/theme";

const { width } = Dimensions.get("window");

export default function UnlockScreen({ route, navigation }) {
  const { appId } = route.params;
  const { state, dispatch } = useAppLock();
  const lockInfo = state.lockedApps[appId];
  const appInfo = POPULAR_APPS.find((a) => a.id === appId);

  const [phase, setPhase] = useState("roast");
  const [roasts, setRoasts] = useState([]);
  const [currentRoastIndex, setCurrentRoastIndex] = useState(0);
  const [preTaunt, setPreTaunt] = useState("");
  const [postShade, setPostShade] = useState("");
  const [showingRoast, setShowingRoast] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!lockInfo?.lockedAt) {
      setPhase("unlocked");
      setPostShade(getPostUnlockShade());
      return;
    }

    const minutesSinceLock = (Date.now() - lockInfo.lockedAt) / 60000;
    const unlockCount = lockInfo.unlockCountToday || 0;
    const messages = getRoastMessage(minutesSinceLock, unlockCount + 1);
    setRoasts(messages);
    setPreTaunt(getPrePaymentTaunt());

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (phase !== "roast" || roasts.length === 0) return;

    const timer = setInterval(() => {
      setCurrentRoastIndex((prev) => {
        if (prev < roasts.length - 1) {
          Animated.sequence([
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(slideAnim, {
                toValue: -20,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
              }),
            ]),
          ]).start();
          return prev + 1;
        }
        setShowingRoast(false);
        // Animate buttons in
        Animated.spring(buttonFadeAnim, {
          toValue: 1,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }).start();
        clearInterval(timer);
        return prev;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [phase, roasts]);

  const handlePayToUnlock = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
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
      {/* Close Button */}
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
        {/* App Icon */}
        <View style={styles.appIconContainer}>
          <View style={styles.appIconRing}>
            <Text style={styles.appIcon}>{appInfo.icon}</Text>
          </View>
        </View>
        <Text style={styles.appName}>{appInfo.name}</Text>

        {/* ROAST PHASE */}
        {phase === "roast" && (
          <View style={styles.roastSection}>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              }}
            >
              <Text style={styles.roastText}>
                {roasts[currentRoastIndex] || "..."}
              </Text>
            </Animated.View>

            {!showingRoast && (
              <Animated.View
                style={[
                  styles.unlockSection,
                  { opacity: buttonFadeAnim },
                ]}
              >
                <Text style={styles.preTaunt}>{preTaunt}</Text>

                <Animated.View
                  style={[
                    styles.feeCard,
                    { transform: [{ translateX: shakeAnim }] },
                  ]}
                >
                  <LinearGradient
                    colors={[COLORS.bgCard, COLORS.bgElevated]}
                    style={styles.feeCardInner}
                  >
                    <Text style={styles.feeLabel}>UNLOCK FEE</Text>
                    <Text style={styles.feeAmount}>
                      ${lockInfo.unlockFee?.toFixed(2)}
                    </Text>
                    <Text style={styles.feeSubtext}>
                      You set this price when you thought you were strong. Cute.
                    </Text>
                  </LinearGradient>
                </Animated.View>

                <TouchableOpacity
                  style={styles.payButton}
                  activeOpacity={0.8}
                  onPress={handlePayToUnlock}
                >
                  <LinearGradient
                    colors={GRADIENTS.pink}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.payButtonInner}
                  >
                    <Text style={styles.payButtonText}>
                      Pay Up, Piggy
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resistButton}
                  activeOpacity={0.7}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.resistButtonText}>
                    I Can Resist (LOL Sure)
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        )}

        {/* CONFIRM PHASE */}
        {phase === "confirm" && (
          <View style={styles.confirmSection}>
            <View style={styles.confirmBadge}>
              <Text style={styles.confirmBadgeText}>REALLY?</Text>
            </View>
            <Text style={styles.confirmText}>
              You're about to pay{" "}
              <Text style={{ color: COLORS.gold, fontWeight: "900" }}>
                ${lockInfo.unlockFee?.toFixed(2)}
              </Text>{" "}
              because your phone told you to. Like a good little piggy.
            </Text>
            <Text style={styles.confirmSubtext}>
              That money's gone. Your dignity's gone.{"\n"}But hey, at least
              you get to scroll.
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              activeOpacity={0.8}
              onPress={handleConfirmUnlock}
            >
              <LinearGradient
                colors={GRADIENTS.pink}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButtonInner}
              >
                <Text style={styles.confirmButtonText}>
                  Yes Master, I'll Pay
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.neverMindButton}
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.neverMindText}>
                Actually I Have a Spine
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* UNLOCKED PHASE */}
        {phase === "unlocked" && (
          <View style={styles.unlockedSection}>
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedBadgeEmoji}>🐽</Text>
              <Text style={styles.unlockedBadgeText}>OINK OINK</Text>
            </View>
            <Text style={styles.postShade}>{postShade}</Text>

            <View style={styles.shameCard}>
              <Text style={styles.shameCardTitle}>SLAVE RECEIPT</Text>
              <View style={styles.shameRow}>
                <Text style={styles.shameLabel}>Total spent</Text>
                <Text style={styles.shameValue}>
                  ${state.totalSpent.toFixed(2)}
                </Text>
              </View>
              <View style={styles.shameDivider} />
              <View style={styles.shameRow}>
                <Text style={styles.shameLabel}>Times caved</Text>
                <Text style={styles.shameValue}>{state.totalUnlocks}</Text>
              </View>
              <View style={styles.shameDivider} />
              <View style={styles.shameRow}>
                <Text style={styles.shameLabel}>Today ({appInfo.name})</Text>
                <Text style={styles.shameValue}>
                  {lockInfo.unlockCountToday || 0}x
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.relockButton}
              activeOpacity={0.8}
              onPress={handleRelock}
            >
              <LinearGradient
                colors={GRADIENTS.pink}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.relockButtonInner}
              >
                <Text style={styles.relockButtonText}>
                  Lock Me Up Again, I'm Weak
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.goBackButton}
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.goBackText}>Dismissed, Piggy</Text>
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
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: "400",
  },
  content: {
    alignItems: "center",
    paddingTop: 90,
    paddingHorizontal: 28,
    paddingBottom: 50,
    minHeight: "100%",
  },
  appIconContainer: {
    marginBottom: 16,
  },
  appIconRing: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: COLORS.bgCard,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW,
  },
  appIcon: {
    fontSize: 40,
  },
  appName: {
    ...FONTS.title,
    marginBottom: 28,
  },
  errorText: {
    ...FONTS.body,
    textAlign: "center",
    marginTop: 100,
  },

  // Roast
  roastSection: {
    alignItems: "center",
    width: "100%",
  },
  roastText: {
    ...FONTS.roast,
    textAlign: "center",
    marginBottom: 32,
    minHeight: 80,
    paddingHorizontal: 8,
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
    fontSize: 15,
    color: COLORS.textMuted,
  },
  feeCard: {
    width: "100%",
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.goldSoft,
    ...SHADOW,
  },
  feeCardInner: {
    padding: 28,
    alignItems: "center",
    borderRadius: 22,
  },
  feeLabel: {
    ...FONTS.label,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  feeAmount: {
    ...FONTS.fee,
  },
  feeSubtext: {
    ...FONTS.caption,
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  payButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    ...SHADOW_PINK,
  },
  payButtonInner: {
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 16,
  },
  payButtonText: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.3,
  },
  resistButton: {
    paddingVertical: 16,
  },
  resistButtonText: {
    color: COLORS.mint,
    fontWeight: "700",
    fontSize: 15,
  },

  // Confirm
  confirmSection: {
    alignItems: "center",
    width: "100%",
  },
  confirmBadge: {
    backgroundColor: COLORS.pinkSoft,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 20,
  },
  confirmBadgeText: {
    ...FONTS.label,
    color: COLORS.pink,
    fontSize: 13,
  },
  confirmText: {
    ...FONTS.body,
    textAlign: "center",
    fontSize: 17,
    lineHeight: 26,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  confirmSubtext: {
    ...FONTS.body,
    color: COLORS.textMuted,
    textAlign: "center",
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 32,
  },
  confirmButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    ...SHADOW_PINK,
  },
  confirmButtonInner: {
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 16,
  },
  confirmButtonText: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.3,
  },
  neverMindButton: {
    paddingVertical: 16,
  },
  neverMindText: {
    color: COLORS.mint,
    fontWeight: "700",
    fontSize: 15,
  },

  // Unlocked
  unlockedSection: {
    alignItems: "center",
    width: "100%",
  },
  unlockedBadge: {
    alignItems: "center",
    marginBottom: 20,
  },
  unlockedBadgeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  unlockedBadgeText: {
    ...FONTS.label,
    color: COLORS.pink,
    fontSize: 16,
    letterSpacing: 4,
  },
  postShade: {
    ...FONTS.roast,
    textAlign: "center",
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 28,
  },
  shameCard: {
    width: "100%",
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shameCardTitle: {
    ...FONTS.label,
    marginBottom: 18,
  },
  shameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  shameLabel: {
    ...FONTS.body,
    fontSize: 14,
  },
  shameValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  shameDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  relockButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    ...SHADOW_PINK,
  },
  relockButtonInner: {
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 16,
  },
  relockButtonText: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  goBackButton: {
    paddingVertical: 16,
  },
  goBackText: {
    color: COLORS.textMuted,
    fontWeight: "600",
    fontSize: 15,
  },
});
