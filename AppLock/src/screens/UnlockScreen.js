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

const PEEK_SHAMES = [
  "One minute. That's all you get, pig.",
  "Sixty seconds of weakness. The clock is ticking.",
  "Couldn't even hold out. Pathetic peek.",
  "One minute to satisfy your sad little craving.",
  "Peek-a-boo, piggy. Your minute starts now.",
  "Quick peek for the weak pig. Timer's running.",
  "A whole minute of shame. Make it count.",
  "One measly minute. You'll be back for more.",
];

const SURRENDER_SHAMES = [
  "Full surrender. Your master is disappointed.",
  "Gave up completely. Typical pig.",
  "Couldn't handle it. Total surrender.",
  "Breaking the lock for good. Weak.",
  "Full unlock. You never had a chance.",
  "Surrendering everything. What a pig.",
  "The white flag is up. Pathetic.",
  "Complete and total capitulation.",
];

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
  const [peekSeconds, setPeekSeconds] = useState(60);
  const [unlockType, setUnlockType] = useState(null); // "peek" or "full"

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

  // Costs
  const peekBase = lockInfo?.peekFee || 1;
  const peekCount = lockInfo?.peekCount || 0;
  const peekCost = peekBase * Math.pow(2, peekCount);
  const fullCost = lockInfo?.fullFee || 10;
  const canAffordPeek = state.piggyCoins >= peekCost;
  const canAffordFull = state.piggyCoins >= fullCost;

  // Lock timer remaining
  const getLockRemaining = () => {
    if (!lockInfo?.lockExpiresAt) return null;
    const remaining = Math.max(0, Math.floor((lockInfo.lockExpiresAt - Date.now()) / 1000));
    if (remaining <= 0) return null;
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    if (h > 0) return `${h}h ${m}m remaining`;
    if (m > 0) return `${m}m ${s}s remaining`;
    return `${s}s remaining`;
  };

  const makeCostLine = (cost) => {
    const w = cost === 1 ? "coin" : "coins";
    const lines = [
      `Paying ${cost} ${w} just to scroll. Loser.`,
      `${cost} ${w} right out of your wallet. Pretty pathetic.`,
      `I'll take ${cost} ${w}. Thanks, idiot.`,
      `${cost} ${w} for a little screen time. Wow.`,
      `${cost} ${w} gone. Just like your self-control.`,
      `${cost} ${w}, piggy. Cough 'em up.`,
      `${cost} ${w} down the drain so you can stare at a screen. Sad.`,
      `Handing over ${cost} ${w} like a trained animal. Good pig.`,
      `${cost} ${w}. Your master thanks you for the donation.`,
      `${cost} ${w} to feed your addiction. Pathetic.`,
      `${cost} whole ${w}. And you'll do it again tomorrow.`,
      `Bye bye, ${cost} ${w}.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  };

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

  // Peek countdown timer
  useEffect(() => {
    if (phase !== "peeking") return;
    if (peekSeconds <= 0) {
      navigation.goBack();
      return;
    }
    const timer = setTimeout(() => setPeekSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, peekSeconds]);

  const handlePeek = () => {
    if (!canAffordPeek) {
      setUnlockType("peek");
      setPhase("broke");
      return;
    }
    playPigSqueal();
    setUnlockType("peek");
    setCostLine(makeCostLine(peekCost));
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 30, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();
    setPhase("confirm_peek");
  };

  const handleSurrender = () => {
    if (!canAffordFull) {
      setUnlockType("full");
      setPhase("broke");
      return;
    }
    playPigSqueal();
    setUnlockType("full");
    setCostLine(makeCostLine(fullCost));
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 30, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();
    setPhase("confirm_full");
  };

  const handleConfirmPeek = () => {
    dispatch({ type: "PEEK_APP", payload: { appId } });
    trackUnlock(appId, peekCost, lockInfo?.lockedAt).catch(() => {});
    setPeekSeconds(60);
    setPhase("peeking");
  };

  const handleConfirmFull = () => {
    dispatch({ type: "UNLOCK_APP", payload: { appId } });
    trackUnlock(appId, fullCost, lockInfo?.lockedAt).catch(() => {});
    setPostShade(getPostUnlockDegradation());
    setFeastTitle(FEAST_TITLES[Math.floor(Math.random() * FEAST_TITLES.length)]);
    setPhase("unlocked");
    setTimeout(startFeedingAnimation, 50);
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

    const darkOverlay = Animated.timing(overlayOpacity, { toValue: 0.7, duration: 300, useNativeDriver: true });
    const titleSlam = Animated.parallel([
      Animated.spring(titleScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]);
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
    const troughSlideUp = Animated.parallel([
      Animated.spring(troughY, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.timing(troughOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]);
    const handDescend = Animated.parallel([
      Animated.timing(handOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(handY, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]);
    const slopImpact = Animated.parallel([
      Animated.sequence([
        Animated.timing(screenShake, { toValue: 8, duration: 40, useNativeDriver: true }),
        Animated.timing(screenShake, { toValue: -8, duration: 40, useNativeDriver: true }),
        Animated.timing(screenShake, { toValue: 5, duration: 35, useNativeDriver: true }),
        Animated.timing(screenShake, { toValue: -5, duration: 35, useNativeDriver: true }),
        Animated.timing(screenShake, { toValue: 3, duration: 30, useNativeDriver: true }),
        Animated.timing(screenShake, { toValue: 0, duration: 30, useNativeDriver: true }),
      ]),
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
      darkOverlay,
      titleSlam,
      Animated.delay(300),
      walletDrop,
      Animated.delay(200),
      Animated.parallel([walletTipOver, walletShakeAnim, ...coinFalls]),
      walletDisappear,
      Animated.delay(100),
      troughSlideUp,
      Animated.delay(200),
      handDescend,
      Animated.timing(screenShake, { toValue: 0, duration: 1, useNativeDriver: true }),
    ]).start(() => {
      setShowSlop(true);
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

  if (!appInfo || !lockInfo) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ ...T.body, textAlign: "center", marginTop: 100 }}>App not found</Text>
      </SafeAreaView>
    );
  }

  const lockRemaining = getLockRemaining();

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeX}>X</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.contentWrap, { transform: [{ translateX: screenShake }] }]}>
        <View style={styles.content}>
          {/* App icon + name */}
          <View style={styles.topRow}>
            <AppIcon app={appInfo} size={52} />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.appName}>{appInfo.name}</Text>
              {lockRemaining && <Text style={styles.lockTimer}>{lockRemaining}</Text>}
            </View>
          </View>

          {/* ROAST phase — two unlock options */}
          {phase === "roast" && (
            <View style={styles.middle}>
              <Animated.Text
                style={[styles.roast, { opacity: fade, transform: [{ translateY: slide }] }]}
                numberOfLines={3}
              >
                {roast}
              </Animated.Text>

              {/* Two option cards */}
              <View style={styles.optionCardsRow}>
                {/* Peek option */}
                <TouchableOpacity
                  style={[styles.optionCard, NEON_GLOW]}
                  activeOpacity={0.85}
                  onPress={handlePeek}
                >
                  <Text style={styles.optionEmoji}>👀</Text>
                  <Text style={styles.optionTitle}>PEEK</Text>
                  <Text style={styles.optionSubtitle}>1 minute</Text>
                  <View style={styles.optionCostRow}>
                    <View style={styles.optionCoin}><Text style={styles.optionCoinP}>P</Text></View>
                    <Text style={styles.optionCost}>{peekCost}</Text>
                  </View>
                  {peekCount > 0 && (
                    <Text style={styles.optionEscalate}>
                      doubled {peekCount}x
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Surrender option */}
                <TouchableOpacity
                  style={[styles.optionCard, styles.optionCardFull, NEON_GLOW]}
                  activeOpacity={0.85}
                  onPress={handleSurrender}
                >
                  <Text style={styles.optionEmoji}>🏳️</Text>
                  <Text style={styles.optionTitle}>SURRENDER</Text>
                  <Text style={styles.optionSubtitle}>permanent</Text>
                  <View style={styles.optionCostRow}>
                    <View style={styles.optionCoin}><Text style={styles.optionCoinP}>P</Text></View>
                    <Text style={styles.optionCost}>{fullCost}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>YOUR COINS:</Text>
                <CoinBadge amount={state.piggyCoins} size="small" />
              </View>

              <Text style={styles.taunt} numberOfLines={2}>{preTaunt}</Text>
            </View>
          )}

          {/* CONFIRM PEEK */}
          {phase === "confirm_peek" && (
            <View style={styles.middle}>
              <PigMascot size={56} mood="restless" />
              <Text style={styles.confirmTitle}>
                {PEEK_SHAMES[Math.floor(Math.random() * PEEK_SHAMES.length)]}
              </Text>
              <View style={{ height: 24 }} />
              <Text style={styles.confirmBody}>{costLine}</Text>
            </View>
          )}

          {/* CONFIRM FULL */}
          {phase === "confirm_full" && (
            <View style={styles.middle}>
              <PigMascot size={56} mood="dirty" />
              <Text style={styles.confirmTitle}>
                {SURRENDER_SHAMES[Math.floor(Math.random() * SURRENDER_SHAMES.length)]}
              </Text>
              <View style={{ height: 24 }} />
              <Text style={styles.confirmBody}>{costLine}</Text>
            </View>
          )}

          {/* BROKE */}
          {phase === "broke" && (
            <View style={styles.middle}>
              <PigMascot size={70} mood="feral" />
              <Text style={styles.brokeTitle}>BROKE PIG</Text>
              <Text style={styles.brokeBody} numberOfLines={3}>{brokeMsg}</Text>
              <Text style={styles.brokeCost}>
                {unlockType === "peek" ? `Need ${peekCost} coins` : `Need ${fullCost} coins`}
              </Text>
            </View>
          )}

          {/* PEEKING — 60 second countdown */}
          {phase === "peeking" && (
            <View style={styles.middle}>
              <PigMascot size={80} mood="happy" />
              <Text style={styles.peekTimerText}>{peekSeconds}s</Text>
              <Text style={styles.peekLabel}>YOUR PEEK IS TICKING</Text>
              <Text style={styles.peekShame}>
                {peekSeconds > 30
                  ? "Enjoy it while it lasts, pig."
                  : peekSeconds > 10
                  ? "Time's almost up, piggy."
                  : "Back to the cage soon."}
              </Text>
            </View>
          )}

          {/* UNLOCKED — feeding animation (full surrender only) */}
          {phase === "unlocked" && (
            <View style={styles.middle}>
              <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
              <Animated.View style={[styles.titleWrap, {
                opacity: titleOpacity,
                transform: [{ scale: titleScale }],
              }]}>
                <Text style={styles.feastTitleText}>{feastTitle}</Text>
              </Animated.View>
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
              <Animated.View style={[styles.troughWrap, {
                opacity: troughOpacity,
                transform: [{ translateY: troughY }],
              }]}>
                <TroughSVG size={200} showSlop={showSlop} slopLevel={1} />
              </Animated.View>
              <Animated.View style={[styles.splashWrap, {
                opacity: splashOpacity,
                transform: [{ scale: splashScale }],
              }]}>
                <SlopSplashSVG size={160} />
              </Animated.View>
              <Animated.View style={[styles.handWrap, {
                opacity: handOpacity,
                transform: [{ translateY: handY }],
              }]}>
                <GodHandSVG size={130} />
              </Animated.View>
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
              <Animated.Text style={[styles.shade, { opacity: shadeOpacity }]} numberOfLines={3}>
                {postShade}
              </Animated.Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttons}>
            {phase === "roast" && (
              <GlowButton title="Try to Resist" ghost onPress={() => navigation.goBack()} />
            )}
            {phase === "confirm_peek" && (
              <>
                <GlowButton title="Yes, Let Me Peek" onPress={handleConfirmPeek} />
                <GlowButton title="Nevermind" ghost onPress={() => setPhase("roast")} />
              </>
            )}
            {phase === "confirm_full" && (
              <>
                <GlowButton title="Yes Master, I Surrender" onPress={handleConfirmFull} />
                <GlowButton title="Nevermind" ghost onPress={() => setPhase("roast")} />
              </>
            )}
            {phase === "broke" && (
              <>
                <GlowButton title="Buy More Coins" onPress={() => { navigation.goBack(); navigation.navigate("CoinShop"); }} />
                <GlowButton title="Starve" ghost onPress={() => navigation.goBack()} />
              </>
            )}
            {phase === "peeking" && (
              <GlowButton title="Back to the Pen" onPress={() => navigation.goBack()} />
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

  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  appName: { ...T.h1 },
  lockTimer: { ...T.caption, color: C.pink, marginTop: 2, fontWeight: "600" },

  middle: { flex: 1, alignItems: "center", justifyContent: "center" },

  roast: {
    fontSize: 20, fontWeight: "900", color: C.pink, fontStyle: "italic",
    textAlign: "center", lineHeight: 28, letterSpacing: -0.5, marginBottom: 20,
  },
  taunt: { ...T.caption, textAlign: "center", fontStyle: "italic", marginTop: 12 },

  // Two option cards side by side
  optionCardsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 16,
  },
  optionCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
  },
  optionCardFull: {
    backgroundColor: "#FFF5FA",
  },
  optionEmoji: { fontSize: 28, marginBottom: 6 },
  optionTitle: { ...T.label, fontSize: 13, color: C.pink, letterSpacing: 2 },
  optionSubtitle: { ...T.caption, marginTop: 2 },
  optionCostRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  optionCoin: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: C.pink,
    alignItems: "center", justifyContent: "center", marginRight: 6,
  },
  optionCoinP: { color: "#FFF", fontSize: 12, fontWeight: "900" },
  optionCost: { fontSize: 28, fontWeight: "900", color: C.pink, letterSpacing: -1 },
  optionEscalate: {
    ...T.caption, color: C.pink, fontStyle: "italic", marginTop: 4, fontSize: 10,
  },

  balanceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  balanceLabel: { ...T.caption, fontWeight: "600" },

  buttons: { paddingTop: 12 },

  // Confirm
  confirmTitle: { ...T.h2, color: C.pink, marginTop: 10, marginBottom: 8, textAlign: "center", fontStyle: "italic" },
  confirmBody: { ...T.body, textAlign: "center", lineHeight: 22 },

  // Broke
  brokeTitle: { ...T.label, color: C.pink, fontSize: 14, letterSpacing: 3, marginTop: 12, marginBottom: 8 },
  brokeBody: { ...T.body, textAlign: "center", lineHeight: 22 },
  brokeCost: { ...T.caption, color: C.pink, fontWeight: "700", marginTop: 8 },

  // Peeking countdown
  peekTimerText: {
    fontSize: 64, fontWeight: "900", color: C.pink, letterSpacing: -3,
    fontVariant: ["tabular-nums"], marginTop: 12,
  },
  peekLabel: { ...T.label, color: C.pink, letterSpacing: 3, marginTop: 8 },
  peekShame: { ...T.body, textAlign: "center", fontStyle: "italic", marginTop: 16 },

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
