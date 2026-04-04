import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";
import { useAppLock } from "../context/AppLockContext";
import { POPULAR_APPS } from "../data/defaultApps";
import AppIcon from "../components/AppIcon";
import PigMascot from "../components/PigMascot";
import CoinBadge from "../components/CoinBadge";
import {
  getSingleRoast,
  getPrePaymentTaunt,
  getPostUnlockDegradation,
  getConfirmMessage,
  getBrokeMessage,
} from "../data/roastMessages";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG, NEON_GLOW } from "../utils/theme";
import { playPigSqueal } from "../utils/sounds";
import GlowButton from "../components/GlowButton";

export default function UnlockScreen({ route, navigation }) {
  const { appId } = route.params;
  const { state, dispatch } = useAppLock();
  const lockInfo = state.lockedApps[appId];
  const appInfo = POPULAR_APPS.find((a) => a.id === appId);

  const [phase, setPhase] = useState("roast");
  const [roast, setRoast] = useState("");
  const [preTaunt, setPreTaunt] = useState("");
  const [postShade, setPostShade] = useState("");
  const [confirmMsg, setConfirmMsg] = useState("");
  const [brokeMsg, setBrokeMsg] = useState("");

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const shake = useRef(new Animated.Value(0)).current;

  const fee = lockInfo?.unlockFee || 0;
  const canAfford = state.piggyCoins >= fee;

  useEffect(() => {
    if (!lockInfo?.lockedAt) {
      setPhase("unlocked");
      setPostShade(getPostUnlockDegradation());
      return;
    }
    const mins = (Date.now() - lockInfo.lockedAt) / 60000;
    setRoast(getSingleRoast(mins));
    setPreTaunt(getPrePaymentTaunt());
    setConfirmMsg(getConfirmMessage());
    setBrokeMsg(getBrokeMessage());

    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePay = () => {
    if (!canAfford) {
      setPhase("broke");
      return;
    }
    playPigSqueal();
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
    setPostShade(getPostUnlockDegradation());
    setPhase("unlocked");
  };

  const handleRelock = () => {
    dispatch({ type: "RELOCK_APP", payload: { appId } });
    navigation.goBack();
  };

  if (!appInfo || !lockInfo) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ ...T.body, textAlign: "center", marginTop: 100 }}>App not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeX}>X</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* App icon + name — always at top */}
        <View style={styles.topRow}>
          <AppIcon app={appInfo} size={52} />
          <Text style={styles.appName}>{appInfo.name}</Text>
        </View>

        {/* ROAST phase */}
        {phase === "roast" && (
          <View style={styles.middle}>
            <Animated.Text
              style={[styles.roast, { opacity: fade, transform: [{ translateY: slide }] }]}
              numberOfLines={3}
            >
              {roast}
            </Animated.Text>

            <Animated.View style={[styles.feeCard, NEON_GLOW, { transform: [{ translateX: shake }] }]}>
              <Text style={styles.feeLabel}>TRIBUTE DEMANDED</Text>
              <View style={styles.feeCoinRow}>
                <View style={styles.feeCoinIcon}><Text style={styles.feeCoinP}>P</Text></View>
                <Text style={styles.feeAmount}>{fee}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>YOUR COINS:</Text>
                <CoinBadge amount={state.piggyCoins} size="small" />
              </View>
            </Animated.View>

            <Text style={styles.taunt} numberOfLines={2}>{preTaunt}</Text>
          </View>
        )}

        {/* BROKE phase */}
        {phase === "broke" && (
          <View style={styles.middle}>
            <PigMascot size={70} mood="feral" />
            <Text style={styles.brokeTitle}>BROKE PIG</Text>
            <Text style={styles.brokeBody} numberOfLines={3}>{brokeMsg}</Text>
          </View>
        )}

        {/* CONFIRM phase */}
        {phase === "confirm" && (
          <View style={styles.middle}>
            <PigMascot size={56} mood="restless" />
            <Text style={styles.confirmTitle}>{confirmMsg}</Text>
            <Text style={styles.confirmBody}>
              <Text style={{ color: C.pink, fontWeight: "900" }}>{fee} {fee === 1 ? "coin" : "coins"}</Text>
              {" "}from your wallet.
            </Text>
          </View>
        )}

        {/* UNLOCKED phase */}
        {phase === "unlocked" && (
          <View style={styles.middle}>
            <PigMascot size={64} mood="happy" />
            <Text style={styles.unlockOink}>OINK OINK</Text>
            <Text style={styles.shade} numberOfLines={3}>{postShade}</Text>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Coins spent</Text>
              <Text style={styles.receiptVal}>{state.totalCoinsSpent}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Times obeyed</Text>
              <Text style={styles.receiptVal}>{state.totalUnlocks}</Text>
            </View>
          </View>
        )}

        {/* Buttons — always at bottom */}
        <View style={styles.buttons}>
          {phase === "roast" && (
            <>
              <GlowButton title="Pay Tribute, Piggy" onPress={handlePay} />
              <GlowButton title="Try to Resist" ghost onPress={() => navigation.goBack()} />
            </>
          )}
          {phase === "broke" && (
            <>
              <GlowButton title="Buy More Coins" onPress={() => { navigation.goBack(); navigation.navigate("CoinShop"); }} />
              <GlowButton title="Starve" ghost onPress={() => navigation.goBack()} />
            </>
          )}
          {phase === "confirm" && (
            <>
              <GlowButton title="Yes Master, I'll Pay" onPress={handleConfirm} />
              <GlowButton title="Disobey" ghost onPress={() => navigation.goBack()} />
            </>
          )}
          {phase === "unlocked" && (
            <>
              <GlowButton title="Lock Me Up Again" onPress={handleRelock} />
              <GlowButton title="Dismissed" ghost onPress={() => navigation.goBack()} />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  closeBtn: {
    position: "absolute", top: 58, right: 20, zIndex: 10,
    width: 34, height: 34, borderRadius: 17, backgroundColor: C.white,
    alignItems: "center", justifyContent: "center", ...CARD_SHADOW,
  },
  closeX: { color: C.textSecondary, fontSize: 15, fontWeight: "600" },

  content: { flex: 1, paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20 },

  // Top — icon + name
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  appName: { ...T.h1, marginLeft: 14 },

  // Middle — flex grows to fill space
  middle: { flex: 1, alignItems: "center", justifyContent: "center" },

  roast: {
    fontSize: 20, fontWeight: "900", color: C.pink, fontStyle: "italic",
    textAlign: "center", lineHeight: 28, letterSpacing: -0.5, marginBottom: 16,
  },
  taunt: { ...T.caption, textAlign: "center", fontStyle: "italic", marginTop: 12 },

  feeCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 20,
    alignItems: "center", width: "100%",
  },
  feeLabel: { ...T.label, marginBottom: 6 },
  feeCoinRow: { flexDirection: "row", alignItems: "center" },
  feeCoinIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: C.pink,
    alignItems: "center", justifyContent: "center", marginRight: 8,
  },
  feeCoinP: { color: "#FFF", fontSize: 14, fontWeight: "900" },
  feeAmount: { fontSize: 40, fontWeight: "900", color: C.pink, letterSpacing: -2 },
  balanceRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 },
  balanceLabel: { ...T.caption, fontWeight: "600" },

  // Buttons — pinned at bottom
  buttons: { paddingTop: 12 },
  pinkBtn: {
    backgroundColor: C.pink, borderRadius: 14,
    paddingVertical: 16, width: "100%", alignItems: "center", marginBottom: 10,
  },
  pinkBtnText: { ...T.button },
  ghostBtn: { paddingVertical: 10, alignItems: "center" },
  ghostBtnText: { ...T.body, color: C.green, fontWeight: "600" },

  // Confirm
  confirmTitle: { ...T.h2, color: C.pink, marginTop: 10, marginBottom: 8, textAlign: "center", fontStyle: "italic" },
  confirmBody: { ...T.body, textAlign: "center", lineHeight: 22 },

  // Broke
  brokeTitle: { ...T.label, color: C.pink, fontSize: 14, letterSpacing: 3, marginTop: 12, marginBottom: 8 },
  brokeBody: { ...T.body, textAlign: "center", lineHeight: 22 },

  // Unlocked
  unlockOink: { ...T.label, color: C.pink, fontSize: 14, letterSpacing: 3, marginTop: 8, marginBottom: 10 },
  shade: { fontSize: 16, fontWeight: "700", color: C.pink, fontStyle: "italic", textAlign: "center", lineHeight: 24, marginBottom: 16 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingVertical: 4 },
  receiptLabel: { ...T.caption },
  receiptVal: { ...T.bodyBold, fontSize: 14 },
});
