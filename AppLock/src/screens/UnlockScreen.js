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
import {
  getRoastMessage,
  getPrePaymentTaunt,
  getPostUnlockShade,
} from "../data/roastMessages";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG } from "../utils/theme";

export default function UnlockScreen({ route, navigation }) {
  const { appId } = route.params;
  const { state, dispatch } = useAppLock();
  const lockInfo = state.lockedApps[appId];
  const appInfo = POPULAR_APPS.find((a) => a.id === appId);

  const [phase, setPhase] = useState("roast");
  const [roasts, setRoasts] = useState([]);
  const [roastIdx, setRoastIdx] = useState(0);
  const [preTaunt, setPreTaunt] = useState("");
  const [postShade, setPostShade] = useState("");
  const [showButtons, setShowButtons] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!lockInfo?.lockedAt) {
      setPhase("unlocked");
      setPostShade(getPostUnlockShade());
      return;
    }
    const mins = (Date.now() - lockInfo.lockedAt) / 60000;
    const count = lockInfo.unlockCountToday || 0;
    setRoasts(getRoastMessage(mins, count + 1));
    setPreTaunt(getPrePaymentTaunt());
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (phase !== "roast" || !roasts.length) return;
    const t = setInterval(() => {
      setRoastIdx((prev) => {
        if (prev < roasts.length - 1) {
          Animated.sequence([
            Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.parallel([
              Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
              Animated.spring(slide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
            ]),
          ]).start();
          slide.setValue(15);
          return prev + 1;
        }
        setShowButtons(true);
        Animated.spring(btnFade, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }).start();
        clearInterval(t);
        return prev;
      });
    }, 2500);
    return () => clearInterval(t);
  }, [phase, roasts]);

  const handlePay = () => {
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
        <Text style={styles.closeX}>✕</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* App icon */}
        <View style={[styles.iconWrap, CARD_SHADOW_LG]}>
          <AppIcon app={appInfo} size={72} />
        </View>
        <Text style={styles.appName}>{appInfo.name}</Text>

        {/* ROAST */}
        {phase === "roast" && (
          <View style={styles.section}>
            <Animated.Text
              style={[
                styles.roast,
                { opacity: fade, transform: [{ translateY: slide }] },
              ]}
            >
              {roasts[roastIdx] || "..."}
            </Animated.Text>

            {showButtons && (
              <Animated.View style={[styles.section, { opacity: btnFade }]}>
                <Text style={styles.taunt}>{preTaunt}</Text>

                <Animated.View
                  style={[styles.feeCard, CARD_SHADOW_LG, { transform: [{ translateX: shake }] }]}
                >
                  <Text style={styles.feeLabel}>UNLOCK FEE</Text>
                  <Text style={styles.feeAmount}>
                    ${lockInfo.unlockFee?.toFixed(2)}
                  </Text>
                  <Text style={styles.feeSub}>
                    You set this when you thought you were strong.
                  </Text>
                </Animated.View>

                <TouchableOpacity style={styles.pinkBtn} activeOpacity={0.85} onPress={handlePay}>
                  <Text style={styles.pinkBtnText}>Pay Up, Piggy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
                  <Text style={styles.ghostBtnText}>I Can Resist (LOL Sure)</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        )}

        {/* CONFIRM */}
        {phase === "confirm" && (
          <View style={styles.section}>
            <View style={[styles.confirmCard, CARD_SHADOW]}>
              <Text style={styles.confirmEmoji}>🤡</Text>
              <Text style={styles.confirmTitle}>Really?</Text>
              <Text style={styles.confirmBody}>
                You're about to hand over{" "}
                <Text style={{ color: C.pink, fontWeight: "800" }}>
                  ${lockInfo.unlockFee?.toFixed(2)}
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
            <Text style={styles.unlockEmoji}>🐽</Text>
            <Text style={styles.unlockOink}>OINK OINK</Text>
            <Text style={styles.shade}>{postShade}</Text>

            <View style={[styles.receipt, CARD_SHADOW]}>
              <Text style={styles.receiptTitle}>SLAVE RECEIPT</Text>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Total tribute</Text>
                <Text style={styles.receiptVal}>${state.totalSpent.toFixed(2)}</Text>
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
  closeX: { color: C.textSecondary, fontSize: 15 },
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
  feeAmount: { ...T.fee },
  feeSub: { ...T.caption, textAlign: "center", marginTop: 10, fontStyle: "italic" },

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
  confirmEmoji: { fontSize: 44, marginBottom: 12 },
  confirmTitle: { ...T.h1, color: C.pink, marginBottom: 10 },
  confirmBody: { ...T.body, textAlign: "center", lineHeight: 24 },

  // Unlocked
  unlockEmoji: { fontSize: 52, marginBottom: 8 },
  unlockOink: { ...T.label, color: C.pink, fontSize: 16, letterSpacing: 4, marginBottom: 16 },
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
