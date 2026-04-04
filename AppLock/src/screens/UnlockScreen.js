import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
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
  const [feastTitle, setFeastTitle] = useState("");

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const shake = useRef(new Animated.Value(0)).current;

  // Feeding animation values
  const walletShake = useRef(new Animated.Value(0)).current;
  const walletTilt = useRef(new Animated.Value(0)).current;
  const coinAnims = useRef([...Array(8)].map(() => ({
    y: new Animated.Value(0),
    x: new Animated.Value(0),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(1),
  }))).current;
  const handY = useRef(new Animated.Value(-120)).current;
  const handOpacity = useRef(new Animated.Value(0)).current;
  const slopOpacity = useRef(new Animated.Value(0)).current;
  const slopScale = useRef(new Animated.Value(0.3)).current;
  const troughOpacity = useRef(new Animated.Value(0)).current;
  const pigScale = useRef(new Animated.Value(0)).current;
  const pigBob = useRef(new Animated.Value(0)).current;
  const shadeOpacity = useRef(new Animated.Value(0)).current;
  const sceneOpacity = useRef(new Animated.Value(0)).current;

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

  const startFeedingAnimation = () => {
    // Reset all
    sceneOpacity.setValue(1);
    walletShake.setValue(0);
    walletTilt.setValue(0);
    coinAnims.forEach((c) => { c.y.setValue(0); c.x.setValue(0); c.opacity.setValue(0); c.scale.setValue(1); });
    handY.setValue(-120);
    handOpacity.setValue(0);
    slopOpacity.setValue(0);
    slopScale.setValue(0.3);
    troughOpacity.setValue(0);
    pigScale.setValue(0);
    pigBob.setValue(0);
    shadeOpacity.setValue(0);

    // Phase 1: Wallet tips over, coins fly out
    const walletAnim = Animated.sequence([
      Animated.timing(walletTilt, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(walletShake, { toValue: 5, duration: 50, useNativeDriver: true }),
          Animated.timing(walletShake, { toValue: -5, duration: 50, useNativeDriver: true }),
        ]),
        { iterations: 4 }
      ),
    ]);

    const coinFalls = coinAnims.map((c, i) =>
      Animated.sequence([
        Animated.delay(i * 80),
        Animated.parallel([
          Animated.timing(c.opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(c.y, { toValue: 180 + Math.random() * 40, duration: 500, useNativeDriver: true }),
          Animated.timing(c.x, { toValue: (Math.random() - 0.5) * 120, duration: 500, useNativeDriver: true }),
          Animated.timing(c.scale, { toValue: 0.4, duration: 500, useNativeDriver: true }),
        ]),
        Animated.timing(c.opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ])
    );

    // Phase 2: Trough appears, hand descends with slop
    const troughAppear = Animated.timing(troughOpacity, { toValue: 1, duration: 300, useNativeDriver: true });

    const handDescend = Animated.parallel([
      Animated.timing(handOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(handY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]);

    const slopDrop = Animated.parallel([
      Animated.timing(slopOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(slopScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
    ]);

    const handRetract = Animated.parallel([
      Animated.timing(handY, { toValue: -120, duration: 400, useNativeDriver: true }),
      Animated.timing(handOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]);

    // Phase 3: Pig appears and feasts (bobs up and down)
    const pigAppear = Animated.spring(pigScale, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true });

    const pigFeast = Animated.loop(
      Animated.sequence([
        Animated.timing(pigBob, { toValue: -8, duration: 200, useNativeDriver: true }),
        Animated.timing(pigBob, { toValue: 4, duration: 200, useNativeDriver: true }),
      ]),
      { iterations: 6 }
    );

    const showShade = Animated.timing(shadeOpacity, { toValue: 1, duration: 400, useNativeDriver: true });

    Animated.sequence([
      // Wallet + coins
      Animated.parallel([walletAnim, ...coinFalls]),
      Animated.delay(200),
      // Trough + hand + slop
      troughAppear,
      Animated.delay(100),
      handDescend,
      slopDrop,
      Animated.delay(200),
      handRetract,
      // Pig feasts
      Animated.delay(100),
      pigAppear,
      pigFeast,
      showShade,
    ]).start();
  };

  const FEAST_TITLES = [
    "FEAST, PIGGY!",
    "PATHETIC. ENJOY YOUR PHONE SLOP.",
    "EAT UP, PIG.",
    "YOUR MASTER HAS FED YOU.",
    "THERE'S YOUR SLOP. NOW EAT.",
    "GOOD PIG. NOW FEAST.",
    "OINK OINK. DINNER IS SERVED.",
    "FEEDING TIME.",
    "DISGUSTING. EAT.",
  ];

  const handleConfirm = () => {
    dispatch({ type: "UNLOCK_APP", payload: { appId } });
    setPostShade(getPostUnlockDegradation());
    setFeastTitle(FEAST_TITLES[Math.floor(Math.random() * FEAST_TITLES.length)]);
    setPhase("unlocked");
    setTimeout(startFeedingAnimation, 50);
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

        {/* UNLOCKED phase — feeding animation */}
        {phase === "unlocked" && (
          <Animated.View style={[styles.middle, { opacity: sceneOpacity }]}>
            {/* Feast title */}
            <Text style={styles.feastTitleText}>{feastTitle}</Text>

            {/* Wallet tipping and spilling coins */}
            <Animated.View style={[styles.walletWrap, {
              transform: [
                { translateX: walletShake },
                { rotate: walletTilt.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "135deg"] }) },
              ],
            }]}>
              <View style={styles.wallet}>
                <Text style={styles.walletEmoji}>👛</Text>
              </View>
            </Animated.View>

            {/* Flying coins */}
            {coinAnims.map((c, i) => (
              <Animated.View key={i} style={[styles.flyingCoin, {
                opacity: c.opacity,
                transform: [
                  { translateY: c.y },
                  { translateX: c.x },
                  { scale: c.scale },
                ],
              }]}>
                <View style={styles.coinCircle}>
                  <Text style={styles.coinP}>P</Text>
                </View>
              </Animated.View>
            ))}

            {/* Trough */}
            <Animated.View style={[styles.troughWrap, { opacity: troughOpacity }]}>
              <View style={styles.trough}>
                <Text style={styles.troughText}>🪣</Text>
              </View>
              <Text style={styles.troughLabel}>THE TROUGH</Text>

              {/* Slop in trough */}
              <Animated.View style={[styles.slopWrap, {
                opacity: slopOpacity,
                transform: [{ scale: slopScale }],
              }]}>
                <Text style={styles.slopEmoji}>🍲</Text>
              </Animated.View>
            </Animated.View>

            {/* God hand from above */}
            <Animated.View style={[styles.handWrap, {
              opacity: handOpacity,
              transform: [{ translateY: handY }],
            }]}>
              <Text style={styles.handEmoji}>🫴</Text>
            </Animated.View>

            {/* Pig feasting */}
            <Animated.View style={[styles.pigFeastWrap, {
              transform: [
                { scale: pigScale },
                { translateY: pigBob },
              ],
            }]}>
              <PigMascot size={80} mood="happy" />
              <Text style={styles.feastText}>*OINK OINK OINK*</Text>
            </Animated.View>

            {/* Post shade message */}
            <Animated.Text style={[styles.shade, { opacity: shadeOpacity }]} numberOfLines={3}>
              {postShade}
            </Animated.Text>
          </Animated.View>
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
              <GlowButton title="Back to the Pen" onPress={() => navigation.goBack()} />
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

  // Unlocked / Feeding animation
  feastTitleText: {
    ...T.h1, color: C.pink, fontSize: 22, textAlign: "center",
    letterSpacing: 2, marginBottom: 8,
  },
  walletWrap: { position: "absolute", top: 40 },
  wallet: { alignItems: "center" },
  walletEmoji: { fontSize: 52 },
  flyingCoin: { position: "absolute", top: 70, alignItems: "center" },
  coinCircle: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: C.pink,
    alignItems: "center", justifyContent: "center",
  },
  coinP: { color: "#FFF", fontSize: 11, fontWeight: "900" },
  troughWrap: { position: "absolute", bottom: 100, alignItems: "center" },
  trough: { alignItems: "center" },
  troughText: { fontSize: 56 },
  troughLabel: { ...T.label, color: C.textSecondary, fontSize: 10, letterSpacing: 3, marginTop: 2 },
  slopWrap: { position: "absolute", top: -8 },
  slopEmoji: { fontSize: 40 },
  handWrap: { position: "absolute", top: 20, alignItems: "center" },
  handEmoji: { fontSize: 72 },
  pigFeastWrap: { position: "absolute", bottom: 50, alignItems: "center" },
  feastText: { ...T.label, color: C.pink, fontSize: 10, letterSpacing: 2, marginTop: 4 },
  shade: {
    fontSize: 16, fontWeight: "700", color: C.pink, fontStyle: "italic",
    textAlign: "center", lineHeight: 24, position: "absolute", bottom: 10,
  },
});
