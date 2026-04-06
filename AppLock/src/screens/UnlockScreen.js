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
import { trackUnlock } from "../utils/usageTracker";
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
import WalletSVG from "../components/art/WalletSVG";
import CoinSVG from "../components/art/CoinSVG";
import TroughSVG from "../components/art/TroughSVG";
import GodHandSVG from "../components/art/GodHandSVG";
import SlopSplashSVG from "../components/art/SlopSplashSVG";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

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
  const [costLine, setCostLine] = useState("");
  const [feastTitle, setFeastTitle] = useState("");
  const [showSlop, setShowSlop] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const shake = useRef(new Animated.Value(0)).current;

  // Feeding animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const walletY = useRef(new Animated.Value(-40)).current;
  const walletOpacity = useRef(new Animated.Value(0)).current;
  const walletTilt = useRef(new Animated.Value(0)).current;
  const walletShake = useRef(new Animated.Value(0)).current;
  const coinAnims = useRef([...Array(12)].map(() => ({
    y: new Animated.Value(0),
    x: new Animated.Value(0),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(1),
    rotate: new Animated.Value(0),
  }))).current;
  const walletFade = useRef(new Animated.Value(1)).current;
  const troughY = useRef(new Animated.Value(60)).current;
  const troughOpacity = useRef(new Animated.Value(0)).current;
  const handY = useRef(new Animated.Value(-200)).current;
  const handOpacity = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const splashScale = useRef(new Animated.Value(0.3)).current;
  const screenShake = useRef(new Animated.Value(0)).current;
  const pigScale = useRef(new Animated.Value(0)).current;
  const pigX = useRef(new Animated.Value(-SCREEN_W)).current;
  const pigBob = useRef(new Animated.Value(0)).current;
  const shadeOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;

  const fee = lockInfo?.unlockFee || 0;
  const canAfford = state.piggyCoins >= fee;
  const coinWord = fee === 1 ? "coin" : "coins";

  const COST_LINES = [
    `Paying ${fee} ${coinWord} just to scroll. Loser.`,
    `${fee} ${coinWord} right out of your wallet. Pretty pathetic.`,
    `I'll take ${fee} ${coinWord}. Thanks, idiot.`,
    `${fee} ${coinWord} for a little screen time. Wow.`,
    `${fee} ${coinWord} gone. Just like your self-control.`,
    `${fee} ${coinWord}, piggy. Cough 'em up.`,
    `${fee} ${coinWord} down the drain so you can stare at a screen. Sad.`,
    `Handing over ${fee} ${coinWord} like a trained animal. Good pig.`,
    `${fee} ${coinWord}. Your master thanks you for the donation.`,
    `${fee} ${coinWord} to feed your addiction. Pathetic.`,
    `${fee} whole ${coinWord}. And you'll do it again tomorrow.`,
    `Bye bye, ${fee} ${coinWord}.`,
  ];

  const pickCostLine = () => COST_LINES[Math.floor(Math.random() * COST_LINES.length)];

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
    setCostLine(pickCostLine());
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
    overlayOpacity.setValue(0);
    titleScale.setValue(0.3);
    titleOpacity.setValue(0);
    walletY.setValue(-40);
    walletOpacity.setValue(0);
    walletTilt.setValue(0);
    walletShake.setValue(0);
    walletFade.setValue(1);
    coinAnims.forEach((c) => {
      c.y.setValue(0); c.x.setValue(0); c.opacity.setValue(0); c.scale.setValue(1); c.rotate.setValue(0);
    });
    troughY.setValue(60);
    troughOpacity.setValue(0);
    handY.setValue(-200);
    handOpacity.setValue(0);
    splashOpacity.setValue(0);
    splashScale.setValue(0.3);
    screenShake.setValue(0);
    pigScale.setValue(0);
    pigX.setValue(-SCREEN_W);
    pigBob.setValue(0);
    shadeOpacity.setValue(0);
    btnOpacity.setValue(0);
    setShowSlop(false);

    // === PHASE 1: Dark overlay + title slam ===
    const darkOverlay = Animated.timing(overlayOpacity, { toValue: 0.7, duration: 300, useNativeDriver: true });
    const titleSlam = Animated.parallel([
      Animated.spring(titleScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]);

    // === PHASE 2: Wallet drops in from top, tips, coins spill ===
    const walletDrop = Animated.parallel([
      Animated.spring(walletY, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(walletOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]);

    const walletTipOver = Animated.timing(walletTilt, { toValue: 1, duration: 500, useNativeDriver: true });

    const walletShakeAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(walletShake, { toValue: 6, duration: 40, useNativeDriver: true }),
        Animated.timing(walletShake, { toValue: -6, duration: 40, useNativeDriver: true }),
      ]),
      { iterations: 6 }
    );

    const coinFalls = coinAnims.map((c, i) =>
      Animated.sequence([
        Animated.delay(i * 60),
        Animated.parallel([
          Animated.timing(c.opacity, { toValue: 1, duration: 80, useNativeDriver: true }),
          Animated.timing(c.y, { toValue: 140 + Math.random() * 60, duration: 600, useNativeDriver: true }),
          Animated.timing(c.x, { toValue: (Math.random() - 0.5) * 160, duration: 600, useNativeDriver: true }),
          Animated.timing(c.scale, { toValue: 0.3 + Math.random() * 0.4, duration: 600, useNativeDriver: true }),
          Animated.timing(c.rotate, { toValue: Math.random() * 4 - 2, duration: 600, useNativeDriver: true }),
        ]),
        Animated.timing(c.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ])
    );

    const walletDisappear = Animated.timing(walletFade, { toValue: 0, duration: 300, useNativeDriver: true });

    // === PHASE 3: Trough slides up ===
    const troughSlideUp = Animated.parallel([
      Animated.spring(troughY, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.timing(troughOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]);

    // === PHASE 4: God hand descends, drops slop, screen shakes ===
    const handDescend = Animated.parallel([
      Animated.timing(handOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(handY, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]);

    const slopImpact = Animated.parallel([
      // Screen shake on impact
      Animated.sequence([
        Animated.timing(screenShake, { toValue: 8, duration: 40, useNativeDriver: true }),
        Animated.timing(screenShake, { toValue: -8, duration: 40, useNativeDriver: true }),
        Animated.timing(screenShake, { toValue: 5, duration: 35, useNativeDriver: true }),
        Animated.timing(screenShake, { toValue: -5, duration: 35, useNativeDriver: true }),
        Animated.timing(screenShake, { toValue: 3, duration: 30, useNativeDriver: true }),
        Animated.timing(screenShake, { toValue: 0, duration: 30, useNativeDriver: true }),
      ]),
      // Splash burst
      Animated.parallel([
        Animated.timing(splashOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.spring(splashScale, { toValue: 1.2, tension: 80, friction: 5, useNativeDriver: true }),
      ]),
    ]);

    const splashFade = Animated.timing(splashOpacity, { toValue: 0, duration: 500, useNativeDriver: true });

    const handRetract = Animated.parallel([
      Animated.timing(handY, { toValue: -200, duration: 500, useNativeDriver: true }),
      Animated.timing(handOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]);

    // === PHASE 5: Pig charges in from left, feasts ===
    const pigCharge = Animated.parallel([
      Animated.spring(pigX, { toValue: 0, tension: 40, friction: 7, useNativeDriver: true }),
      Animated.spring(pigScale, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }),
    ]);

    const pigFeast = Animated.loop(
      Animated.sequence([
        Animated.timing(pigBob, { toValue: -12, duration: 180, useNativeDriver: true }),
        Animated.timing(pigBob, { toValue: 6, duration: 180, useNativeDriver: true }),
      ]),
      { iterations: 8 }
    );

    const showShade = Animated.parallel([
      Animated.timing(shadeOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(btnOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]);

    Animated.sequence([
      // Overlay + title
      darkOverlay,
      titleSlam,
      Animated.delay(300),
      // Wallet drops, tips, coins spill
      walletDrop,
      Animated.delay(200),
      Animated.parallel([walletTipOver, walletShakeAnim, ...coinFalls]),
      walletDisappear,
      Animated.delay(100),
      // Trough slides up
      troughSlideUp,
      Animated.delay(200),
      // Hand descends
      handDescend,
      // Slop fills (callback to show SVG slop)
      Animated.timing(screenShake, { toValue: 0, duration: 1, useNativeDriver: true }),
    ]).start(() => {
      setShowSlop(true);
      // Continue with impact + pig
      Animated.sequence([
        slopImpact,
        Animated.parallel([splashFade, handRetract]),
        Animated.delay(100),
        pigCharge,
        pigFeast,
        Animated.delay(200),
        showShade,
      ]).start();
    });
  };

  const FEAST_TITLES = [
    "FEAST, PIGGY!",
    "PATHETIC. ENJOY YOUR SLOP.",
    "EAT UP, PIG.",
    "YOUR MASTER HAS FED YOU.",
    "THERE'S YOUR SLOP. NOW EAT.",
    "GOOD PIG. NOW FEAST.",
    "DINNER IS SERVED.",
    "FEEDING TIME.",
    "DISGUSTING. EAT.",
  ];

  const handleConfirm = () => {
    dispatch({ type: "UNLOCK_APP", payload: { appId } });
    trackUnlock(appId, fee, lockInfo?.lockedAt).catch(() => {});
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

      <Animated.View style={[styles.contentWrap, { transform: [{ translateX: screenShake }] }]}>
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
              <View style={{ height: 24 }} />
              <Text style={styles.confirmBody}>{costLine}</Text>
            </View>
          )}

          {/* UNLOCKED phase — feeding animation */}
          {phase === "unlocked" && (
            <View style={styles.middle}>
              {/* Dark overlay */}
              <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />

              {/* Feast title — slams in */}
              <Animated.View style={[styles.titleWrap, {
                opacity: titleOpacity,
                transform: [{ scale: titleScale }],
              }]}>
                <Text style={styles.feastTitleText}>{feastTitle}</Text>
              </Animated.View>

              {/* Wallet drops in, tips, coins spill */}
              <Animated.View style={[styles.walletWrap, {
                opacity: Animated.multiply(walletOpacity, walletFade),
                transform: [
                  { translateY: walletY },
                  { translateX: walletShake },
                  { rotate: walletTilt.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "145deg"] }) },
                ],
              }]}>
                <WalletSVG size={90} />
              </Animated.View>

              {/* Flying coins — 12 of them, varied sizes */}
              {coinAnims.map((c, i) => (
                <Animated.View key={i} style={[styles.flyingCoin, {
                  opacity: c.opacity,
                  transform: [
                    { translateY: c.y },
                    { translateX: c.x },
                    { scale: c.scale },
                    { rotate: c.rotate.interpolate({ inputRange: [-2, 2], outputRange: ["-180deg", "180deg"] }) },
                  ],
                }]}>
                  <CoinSVG size={28 + (i % 3) * 6} />
                </Animated.View>
              ))}

              {/* Trough slides up from bottom */}
              <Animated.View style={[styles.troughWrap, {
                opacity: troughOpacity,
                transform: [{ translateY: troughY }],
              }]}>
                <TroughSVG size={200} showSlop={showSlop} slopLevel={1} />
              </Animated.View>

              {/* Slop splash on impact */}
              <Animated.View style={[styles.splashWrap, {
                opacity: splashOpacity,
                transform: [{ scale: splashScale }],
              }]}>
                <SlopSplashSVG size={160} />
              </Animated.View>

              {/* God hand descends from above */}
              <Animated.View style={[styles.handWrap, {
                opacity: handOpacity,
                transform: [{ translateY: handY }],
              }]}>
                <GodHandSVG size={130} />
              </Animated.View>

              {/* Pig charges in from left, bobs feasting */}
              <Animated.View style={[styles.pigFeastWrap, {
                transform: [
                  { translateX: pigX },
                  { scale: pigScale },
                  { translateY: pigBob },
                ],
              }]}>
                <PigMascot size={90} mood="happy" />
                <Text style={styles.feastText}>*OINK OINK OINK*</Text>
              </Animated.View>

              {/* Post shade message */}
              <Animated.Text style={[styles.shade, { opacity: shadeOpacity }]} numberOfLines={3}>
                {postShade}
              </Animated.Text>
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
              <Animated.View style={{ opacity: btnOpacity }}>
                <GlowButton title="Back to the Pen" onPress={() => navigation.goBack()} />
              </Animated.View>
            )}
          </View>
        </View>
      </Animated.View>
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

  contentWrap: { flex: 1 },
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

  // Confirm
  confirmTitle: { ...T.h2, color: C.pink, marginTop: 10, marginBottom: 8, textAlign: "center", fontStyle: "italic" },
  confirmBody: { ...T.body, textAlign: "center", lineHeight: 22 },

  // Broke
  brokeTitle: { ...T.label, color: C.pink, fontSize: 14, letterSpacing: 3, marginTop: 12, marginBottom: 8 },
  brokeBody: { ...T.body, textAlign: "center", lineHeight: 22 },

  // === FEEDING ANIMATION ===
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1A0A10",
    zIndex: 0,
  },
  titleWrap: { position: "absolute", top: 10, zIndex: 10, alignItems: "center" },
  feastTitleText: {
    fontSize: 26, fontWeight: "900", color: C.pink,
    textAlign: "center", letterSpacing: 3, textTransform: "uppercase",
    textShadowColor: "rgba(255,105,180,0.6)", textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  walletWrap: { position: "absolute", top: 50, zIndex: 5 },
  flyingCoin: { position: "absolute", top: 90, zIndex: 6 },
  troughWrap: { position: "absolute", bottom: 60, zIndex: 3, alignItems: "center" },
  splashWrap: { position: "absolute", bottom: 100, zIndex: 4, alignItems: "center" },
  handWrap: { position: "absolute", top: -20, zIndex: 7, alignItems: "center" },
  pigFeastWrap: { position: "absolute", bottom: 95, zIndex: 8, alignItems: "center" },
  feastText: {
    fontSize: 11, fontWeight: "900", color: C.pink,
    letterSpacing: 3, marginTop: 2,
    textShadowColor: "rgba(255,105,180,0.5)", textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  shade: {
    fontSize: 16, fontWeight: "700", color: "#FFF", fontStyle: "italic",
    textAlign: "center", lineHeight: 24, position: "absolute", bottom: 10, zIndex: 10,
    textShadowColor: "rgba(255,105,180,0.8)", textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
});
