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
  getSingleRoast,
  getPrePaymentTaunt,
  getPostUnlockDegradation,
  getConfirmMessage,
  getBrokeMessage,
} from "../data/roastMessages";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG } from "../utils/theme";

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
  const btnFade = useRef(new Animated.Value(0)).current;
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.iconWrap, CARD_SHADOW_LG]}>
          <AppIcon app={appInfo} size={72} />
        </View>
        <Text style={styles.appName}>{appInfo.name}</Text>

        {/* ROAST — master addresses the pig */}
        {phase === "roast" && (
          <View style={styles.section}>
            <Animated.Text
              style={[styles.roast, { opacity: fade, transform: [{ translateY: slide }] }]}
            >
              {roast}
            </Animated.Text>

            <Animated.View style={[styles.section, { opacity: btnFade }]}>
              <Text style={styles.taunt}>{preTaunt}</Text>

              <Animated.View style={[styles.feeCard, CARD_SHADOW_LG, { transform: [{ translateX: shake }] }]}>
                <Text style={styles.feeLabel}>TRIBUTE DEMANDED</Text>
                <View style={styles.feeCoinRow}>
                  <View style={styles.feeCoinIcon}><Text style={styles.feeCoinP}>P</Text></View>
                  <Text style={styles.feeAmount}>{fee}</Text>
                </View>
                <Text style={styles.feeSub}>Your master set the price. You will pay it.</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Your coins:</Text>
                  <CoinBadge amount={state.piggyCoins} size="small" />
                </View>
              </Animated.View>

              <TouchableOpacity style={styles.pinkBtn} activeOpacity={0.85} onPress={handlePay}>
                <Text style={styles.pinkBtnText}>Pay Tribute, Piggy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.ghostBtnText}>Try to Resist</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* BROKE */}
        {phase === "broke" && (
          <View style={styles.section}>
            <PigMascot size={90} mood="feral" />
            <Text style={styles.brokeTitle}>BROKE PIG</Text>
            <Text style={styles.brokeBody}>
              {brokeMsg}
            </Text>

            <TouchableOpacity
              style={styles.pinkBtn}
              activeOpacity={0.85}
              onPress={() => { navigation.goBack(); navigation.navigate("CoinShop"); }}
            >
              <Text style={styles.pinkBtnText}>Fill the Trough</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.ghostBtnText}>Starve</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CONFIRM */}
        {phase === "confirm" && (
          <View style={styles.section}>
            <View style={[styles.confirmCard, CARD_SHADOW]}>
              <PigMascot size={60} mood="restless" />
              <Text style={styles.confirmTitle}>{confirmMsg}</Text>
              <Text style={styles.confirmBody}>
                <Text style={{ color: C.pink, fontWeight: "800" }}>{fee} coins</Text>
                {" "}from the pig's trough. Your master is waiting.
              </Text>
            </View>

            <TouchableOpacity style={styles.pinkBtn} activeOpacity={0.85} onPress={handleConfirm}>
              <Text style={styles.pinkBtnText}>Yes Master, I'll Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.ghostBtnText}>Disobey</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* UNLOCKED — pig is fed, happy, but degraded */}
        {phase === "unlocked" && (
          <View style={styles.section}>
            <PigMascot size={80} mood="happy" />
            <Text style={styles.unlockOink}>OINK OINK</Text>
            <Text style={styles.shade}>{postShade}</Text>

            <View style={[styles.receipt, CARD_SHADOW]}>
              <Text style={styles.receiptTitle}>PIG'S RECEIPT</Text>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Total coins fed to master</Text>
                <Text style={styles.receiptVal}>{state.totalCoinsSpent}</Text>
              </View>
              <View style={styles.receiptDivider} />
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Times the pig obeyed</Text>
                <Text style={styles.receiptVal}>{state.totalUnlocks}</Text>
              </View>
              <View style={styles.receiptDivider} />
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Today</Text>
                <Text style={styles.receiptVal}>{lockInfo.unlockCountToday || 0}x</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.pinkBtn} activeOpacity={0.85} onPress={handleRelock}>
              <Text style={styles.pinkBtnText}>Lock Me Up Again, Master</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.ghostBtnText}>Dismissed, Pig</Text>
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
    position: "absolute", top: 58, right: 20, zIndex: 10,
    width: 34, height: 34, borderRadius: 17, backgroundColor: C.white,
    alignItems: "center", justifyContent: "center", ...CARD_SHADOW,
  },
  closeX: { color: C.textSecondary, fontSize: 15, fontWeight: "600" },
  content: { alignItems: "center", paddingTop: 80, paddingHorizontal: 28, paddingBottom: 50 },
  iconWrap: { marginBottom: 16 },
  appName: { ...T.h1, marginBottom: 24 },
  section: { alignItems: "center", width: "100%" },

  roast: {
    fontSize: 22, fontWeight: "800", color: C.pink, fontStyle: "italic",
    textAlign: "center", lineHeight: 32, minHeight: 70, marginBottom: 24,
  },
  taunt: { ...T.body, textAlign: "center", fontStyle: "italic", marginBottom: 20 },
  feeCard: { backgroundColor: C.white, borderRadius: 24, padding: 28, alignItems: "center", width: "100%", marginBottom: 24 },
  feeLabel: { ...T.label, marginBottom: 8 },
  feeCoinRow: { flexDirection: "row", alignItems: "center" },
  feeCoinIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.pink, alignItems: "center", justifyContent: "center", marginRight: 10 },
  feeCoinP: { color: "#FFF", fontSize: 16, fontWeight: "900" },
  feeAmount: { fontSize: 48, fontWeight: "900", color: C.pink, letterSpacing: -2 },
  feeSub: { ...T.caption, textAlign: "center", marginTop: 10, fontStyle: "italic" },
  balanceRow: { flexDirection: "row", alignItems: "center", marginTop: 14, gap: 8 },
  balanceLabel: { ...T.caption, fontWeight: "600" },

  pinkBtn: { backgroundColor: C.pink, borderRadius: 14, paddingVertical: 17, width: "100%", alignItems: "center", marginBottom: 12 },
  pinkBtnText: { ...T.button },
  ghostBtn: { paddingVertical: 14 },
  ghostBtnText: { ...T.body, color: C.green, fontWeight: "600" },

  confirmCard: { backgroundColor: C.white, borderRadius: 20, padding: 24, alignItems: "center", width: "100%", marginBottom: 24 },
  confirmTitle: { ...T.h2, color: C.pink, marginBottom: 10, marginTop: 12, textAlign: "center", fontStyle: "italic" },
  confirmBody: { ...T.body, textAlign: "center", lineHeight: 24 },

  brokeTitle: { ...T.label, color: C.pink, fontSize: 16, letterSpacing: 4, marginTop: 16, marginBottom: 12 },
  brokeBody: { ...T.body, textAlign: "center", lineHeight: 24, marginBottom: 24 },

  unlockOink: { ...T.label, color: C.pink, fontSize: 16, letterSpacing: 4, marginTop: 12, marginBottom: 16 },
  shade: { fontSize: 17, fontWeight: "700", color: C.pink, fontStyle: "italic", textAlign: "center", lineHeight: 26, marginBottom: 24 },
  receipt: { backgroundColor: C.white, borderRadius: 20, padding: 22, width: "100%", marginBottom: 24 },
  receiptTitle: { ...T.label, marginBottom: 16 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  receiptLabel: { ...T.body, fontSize: 14 },
  receiptVal: { ...T.bodyBold, fontSize: 15 },
  receiptDivider: { height: 1, backgroundColor: C.divider, marginVertical: 10 },
});
