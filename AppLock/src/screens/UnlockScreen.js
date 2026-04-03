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
import AppIcon from "../components/AppIcon";
import PigMascot from "../components/PigMascot";
import CoinBadge from "../components/CoinBadge";
import {
  getPrePaymentTaunt,
  getPostUnlockShade,
  IMMEDIATE_ROASTS,
  TIME_BASED_ROASTS,
} from "../data/roastMessages";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG } from "../utils/theme";

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSingleRoast(minutesSinceLock) {
  // Pick one good roast based on time
  const timeBucket = TIME_BASED_ROASTS.find(
    (b) => minutesSinceLock < b.maxMinutes
  );
  if (timeBucket) {
    return pickRandom(timeBucket.messages).replace(
      "{minutes}",
      Math.floor(minutesSinceLock)
    );
  }
  return pickRandom(IMMEDIATE_ROASTS);
}

export default function UnlockScreen({ route, navigation }) {
  const { appId } = route.params;
  const { state, dispatch } = useAppLock();
  const lockInfo = state.lockedApps[appId];
  const appInfo = POPULAR_APPS.find((a) => a.id === appId);

  const [phase, setPhase] = useState("roast");
  const [roast, setRoast] = useState("");
  const [preTaunt, setPreTaunt] = useState("");
  const [postShade, setPostShade] = useState("");

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  const fee = lockInfo?.unlockFee || 0;
  const canAfford = state.piggyCoins >= fee;

  useEffect(() => {
    if (!lockInfo?.lockedAt) {
      setPhase("unlocked");
      setPostShade(getPostUnlockShade());
      return;
    }
    const mins = (Date.now() - lockInfo.lockedAt) / 60000;
    setRoast(getSingleRoast(mins));
    setPreTaunt(getPrePaymentTaunt());

    // Animate roast in, then show buttons after delay
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.spring(btnFade, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }).start();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handlePay = () => {
    if (!canAfford) {
      setPhase("broke");
      return;
    }
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 30, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();
    setPhase("confirm");
  };

  const handleConfirm = () => {
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
      <SafeAreaView style={styles.safe}>
        <Text style={{ ...T.body, textAlign: "center", marginTop: 100 }}>
          App not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeX}>X</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* App icon */}
        <View style={[styles.iconWrap, CARD_SHADOW_LG]}>
          <AppIcon app={appInfo} size={72} />
        </View>
        <Text style={styles.appName}>{appInfo.name}</Text>

        {/* ROAST — single message */}
        {phase === "roast" && (
          <View style={styles.section}>
            <Animated.Text
              style={[
                styles.roast,
                { opacity: fade, transform: [{ translateY: slide }] },
              ]}
            >
              {roast}
            </Animated.Text>

            <Animated.View style={[styles.section, { opacity: btnFade }]}>
              <Text style={styles.taunt}>{preTaunt}</Text>

              <Animated.View
                style={[styles.feeCard, CARD_SHADOW_LG, { transform: [{ translateX: shake }] }]}
              >
                <Text style={styles.feeLabel}>UNLOCK FEE</Text>
                <View style={styles.feeCoinRow}>
                  <View style={styles.feeCoinIcon}>
                    <Text style={styles.feeCoinP}>P</Text>
                  </View>
                  <Text style={styles.feeAmount}>{fee}</Text>
                </View>
                <Text style={styles.feeSub}>
                  You set this when you thought you were strong.
                </Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Your balance:</Text>
                  <CoinBadge amount={state.piggyCoins} size="small" />
                </View>
              </Animated.View>

              <TouchableOpacity style={styles.pinkBtn} activeOpacity={0.85} onPress={handlePay}>
                <Text style={styles.pinkBtnText}>Pay Up, Piggy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.ghostBtnText}>I Can Resist (LOL Sure)</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* BROKE */}
        {phase === "broke" && (
          <View style={styles.section}>
            <PigMascot size={90} mood="crying" />
            <Text style={styles.brokeTitle}>EMPTY TROUGH</Text>
            <Text style={styles.brokeBody}>
              You need {fee} coins but you only have {state.piggyCoins}.
              {"\n\n"}Your trough is empty and so is your willpower. Go buy more coins like the obedient little piggy you are.
            </Text>

            <TouchableOpacity
              style={styles.pinkBtn}
              activeOpacity={0.85}
              onPress={() => {
                navigation.goBack();
                navigation.navigate("CoinShop");
              }}
            >
              <Text style={styles.pinkBtnText}>Buy More Coins</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.ghostBtnText}>Sit Here and Suffer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CONFIRM */}
        {phase === "confirm" && (
          <View style={styles.section}>
            <View style={[styles.confirmCard, CARD_SHADOW]}>
              <PigMascot size={60} />
              <Text style={styles.confirmTitle}>Really?</Text>
              <Text style={styles.confirmBody}>
                You're about to hand over{" "}
                <Text style={{ color: C.pink, fontWeight: "800" }}>
                  {fee} coins
                </Text>{" "}
                because your phone told you to.
              </Text>
            </View>

            <TouchableOpacity style={styles.pinkBtn} activeOpacity={0.85} onPress={handleConfirm}>
              <Text style={styles.pinkBtnText}>Yes Master, I'll Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.ghostBtnText}>Actually I Have a Spine</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* UNLOCKED */}
        {phase === "unlocked" && (
          <View style={styles.section}>
            <PigMascot size={80} />
            <Text style={styles.unlockOink}>OINK OINK</Text>
            <Text style={styles.shade}>{postShade}</Text>

            <View style={[styles.receipt, CARD_SHADOW]}>
              <Text style={styles.receiptTitle}>SLAVE RECEIPT</Text>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Coins spent total</Text>
                <Text style={styles.receiptVal}>{state.totalCoinsSpent}</Text>
              </View>
              <View style={styles.receiptDivider} />
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Times obeyed</Text>
                <Text style={styles.receiptVal}>{state.totalUnlocks}</Text>
              </View>
              <View style={styles.receiptDivider} />
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Today</Text>
                <Text style={styles.receiptVal}>{lockInfo.unlockCountToday || 0}x</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.pinkBtn} activeOpacity={0.85} onPress={handleRelock}>
              <Text style={styles.pinkBtnText}>Lock Me Up Again, I'm Weak</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.ghostBtnText}>Dismissed, Piggy</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  closeBtn: {
    position: "absolute",
    top: 58,
    right: 20,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  closeX: { color: C.textSecondary, fontSize: 15, fontWeight: "600" },
  content: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 28,
    paddingBottom: 50,
  },
  iconWrap: { marginBottom: 16 },
  appName: { ...T.h1, marginBottom: 24 },
  section: { alignItems: "center", width: "100%" },

  // Roast
  roast: {
    fontSize: 22,
    fontWeight: "800",
    color: C.pink,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 32,
    minHeight: 70,
    marginBottom: 24,
  },
  taunt: {
    ...T.body,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 20,
  },
  feeCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  feeLabel: { ...T.label, marginBottom: 8 },
  feeCoinRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  feeCoinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  feeCoinP: { color: "#FFF", fontSize: 16, fontWeight: "900" },
  feeAmount: { fontSize: 48, fontWeight: "900", color: C.pink, letterSpacing: -2 },
  feeSub: { ...T.caption, textAlign: "center", marginTop: 10, fontStyle: "italic" },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },
  balanceLabel: { ...T.caption, fontWeight: "600" },

  // Buttons
  pinkBtn: {
    backgroundColor: C.pink,
    borderRadius: 14,
    paddingVertical: 17,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  pinkBtnText: { ...T.button },
  ghostBtn: { paddingVertical: 14 },
  ghostBtnText: { ...T.body, color: C.green, fontWeight: "600" },

  // Confirm
  confirmCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  confirmTitle: { ...T.h1, color: C.pink, marginBottom: 10, marginTop: 12 },
  confirmBody: { ...T.body, textAlign: "center", lineHeight: 24 },

  // Broke
  brokeTitle: { ...T.label, color: C.pink, fontSize: 16, letterSpacing: 4, marginTop: 16, marginBottom: 12 },
  brokeBody: {
    ...T.body,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },

  // Unlocked
  unlockOink: { ...T.label, color: C.pink, fontSize: 16, letterSpacing: 4, marginTop: 12, marginBottom: 16 },
  shade: {
    fontSize: 17,
    fontWeight: "700",
    color: C.pink,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 24,
  },
  receipt: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 22,
    width: "100%",
    marginBottom: 24,
  },
  receiptTitle: { ...T.label, marginBottom: 16 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  receiptLabel: { ...T.body, fontSize: 14 },
  receiptVal: { ...T.bodyBold, fontSize: 15 },
  receiptDivider: { height: 1, backgroundColor: C.divider, marginVertical: 10 },
});
