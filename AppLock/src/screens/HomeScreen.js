import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Alert,
  PanResponder,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "../context/AppLockContext";
import { POPULAR_APPS } from "../data/defaultApps";
import AppIcon from "../components/AppIcon";
import PigMascot from "../components/PigMascot";
import CoinBadge from "../components/CoinBadge";
import { getStarvingMessage } from "../data/roastMessages";
import { getPigWeight, getWeightProgress } from "../utils/pigWeight";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG, NEU_RAISED, NEON_GLOW } from "../utils/theme";
import GlowButton from "../components/GlowButton";
let Haptics = null;
try { Haptics = require("expo-haptics"); } catch (e) {}

const { width: SCREEN_W } = Dimensions.get("window");

function WiggleWrap({ wiggle, children, style }) {
  const rotate = useRef(new Animated.Value(0)).current;
  const animRef = useRef(null);

  useEffect(() => {
    if (wiggle) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(rotate, { toValue: 1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: -1, duration: 80, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 0.5, duration: 70, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: -0.5, duration: 70, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 0, duration: 60, easing: Easing.linear, useNativeDriver: true }),
          Animated.delay(400),
        ])
      );
      animRef.current = anim;
      anim.start();
    } else {
      if (animRef.current) animRef.current.stop();
      rotate.setValue(0);
    }
    return () => { if (animRef.current) animRef.current.stop(); };
  }, [wiggle]);

  const spin = rotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-1.5deg", "1.5deg"],
  });

  return (
    <Animated.View style={[style, { transform: [{ rotate: spin }] }]}>
      {children}
    </Animated.View>
  );
}
const CARD_W = SCREEN_W - 64;
const CARD_SPACING = 12;
const SNAP_INTERVAL = CARD_W + CARD_SPACING;

function getTributeClock(lastTributeTime) {
  if (!lastTributeTime) return { text: "Never", minutes: Infinity };
  const totalSecs = Math.floor((Date.now() - lastTributeTime) / 1000);
  const mins = Math.floor(totalSecs / 60);
  if (totalSecs < 60) return { text: `${totalSecs}s ago`, minutes: 0 };
  if (mins < 60) return { text: `${mins}m ago`, minutes: mins };
  const h = Math.floor(mins / 60);
  if (h < 24) return { text: `${h}h ${mins % 60}m ago`, minutes: mins };
  const d = Math.floor(h / 24);
  return { text: `${d}d ${h % 24}h ago`, minutes: mins };
}

function getPigMood(minutes) {
  // After feeding the pig is dirty/ashamed, then slowly cleans up over time
  if (minutes < 5) return "dirty";       // Just fed — covered in slop, ashamed
  if (minutes < 30) return "messy";      // Still messy, recovering
  if (minutes < 120) return "restless";  // Getting cleaner, starting to itch
  if (minutes < 360) return "clean";     // Clean but tempted
  return "feral";                        // Too long — feral, master is angry
}

export default function HomeScreen({ navigation }) {
  const { state, dispatch } = useAppLock();
  const lockedAppIds = Object.keys(state.lockedApps);
  const allTrackedApps = POPULAR_APPS.filter((a) => lockedAppIds.includes(a.id));
  // Sort: locked apps first, unlocked apps at the end
  const lockedApps = [...allTrackedApps].sort((a, b) => {
    const aLocked = !!state.lockedApps[a.id]?.lockedAt;
    const bLocked = !!state.lockedApps[b.id]?.lockedAt;
    if (aLocked === bLocked) return 0;
    return aLocked ? -1 : 1;
  });
  const [now, setNow] = useState(Date.now());
  const [activeIndex, setActiveIndex] = useState(0);
  const [deleteMode, setDeleteMode] = useState(null); // appId being deleted or null
  const carouselRef = useRef(null);
  const activeIndexRef = useRef(0);

  const lockedCountRef = useRef(0);
  lockedCountRef.current = lockedApps.length;

  const scrollToPage = (index) => {
    const clamped = Math.max(0, Math.min(index, lockedCountRef.current - 1));
    try {
      carouselRef.current?.scrollToIndex({ index: clamped, animated: true });
    } catch (e) {}
    setActiveIndex(clamped);
    activeIndexRef.current = clamped;
  };

  const dotSwipeStart = useRef(0);
  const dotTapX = useRef(0);
  const dotsMoved = useRef(false);
  const dotsLayoutRef = useRef({ x: 0, width: 0 });

  const dotPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderGrant: (e) => {
        dotSwipeStart.current = activeIndexRef.current;
        dotTapX.current = e.nativeEvent.locationX;
        dotsMoved.current = false;
      },
      onPanResponderMove: (_, g) => {
        if (Math.abs(g.dx) < 8) return;
        dotsMoved.current = true;
        const pageDelta = Math.round(g.dx / -40);
        const target = dotSwipeStart.current + pageDelta;
        const clamped = Math.max(0, Math.min(target, lockedCountRef.current - 1));
        if (clamped !== activeIndexRef.current) {
          try {
            carouselRef.current?.scrollToIndex({ index: clamped, animated: true });
          } catch (e) {}
          activeIndexRef.current = clamped;
          setActiveIndex(clamped);
        }
      },
      onPanResponderRelease: () => {
        if (!dotsMoved.current && lockedCountRef.current > 0) {
          // It was a tap — figure out which dot based on tap position
          const totalDotsWidth = lockedCountRef.current * 16; // 8px dot + 8px margin
          const startX = (dotsLayoutRef.current.width - totalDotsWidth) / 2;
          const tapIdx = Math.floor((dotTapX.current - startX) / 16);
          const clamped = Math.max(0, Math.min(tapIdx, lockedCountRef.current - 1));
          scrollToPage(clamped);
        }
      },
    })
  ).current;

  // Pick one phrase per app session — useRef so it doesn't change on re-render
  const moodKey = useRef(null);
  const moodMessageRef = useRef(null);
  // Tick every second when any active lock/peek timers exist, otherwise every 30s
  const hasActiveTimers = Object.values(state.lockedApps).some(
    (a) => (a.lockedAt && a.lockExpiresAt) || a.peekExpiresAt
  );
  const tributeSecs = state.lastTributeTime ? Math.floor((Date.now() - state.lastTributeTime) / 1000) : Infinity;
  const tickRate = hasActiveTimers || tributeSecs < 60 ? 1000 : 30000;
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), tickRate);
    return () => clearInterval(interval);
  }, [tickRate]);

  const tribute = getTributeClock(state.lastTributeTime);
  const pigMood = getPigMood(tribute.minutes);

  // Only pick a new message if mood category changed or first render
  if (moodKey.current !== pigMood) {
    moodKey.current = pigMood;
    moodMessageRef.current = getStarvingMessage(pigMood);
  }
  const moodMessage = moodMessageRef.current;

  const getTimeSince = (appId) => {
    const app = state.lockedApps[appId];
    if (!app?.lockedAt) return "";
    const mins = Math.floor((Date.now() - app.lockedAt) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  const isLocked = (appId) => {
    const app = state.lockedApps[appId];
    if (!app) return false;
    // Locked if lockedAt is set AND not currently peeking
    if (app.lockedAt && (!app.peekExpiresAt || Date.now() >= app.peekExpiresAt)) return true;
    return false;
  };

  const isPeeking = (appId) => {
    const app = state.lockedApps[appId];
    return app?.peekExpiresAt && Date.now() < app.peekExpiresAt;
  };

  const getLockCountdown = (appId) => {
    const app = state.lockedApps[appId];
    if (!app?.lockExpiresAt || !app.lockedAt) return null;
    const remaining = Math.max(0, Math.floor((app.lockExpiresAt - Date.now()) / 1000));
    if (remaining <= 0) return null;
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const getPeekCountdown = (appId) => {
    const app = state.lockedApps[appId];
    if (!app?.peekExpiresAt) return null;
    const remaining = Math.max(0, Math.floor((app.peekExpiresAt - Date.now()) / 1000));
    if (remaining <= 0) return null;
    return `${remaining}s`;
  };

  const onScrollEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setActiveIndex(idx);
    activeIndexRef.current = idx;
  };

  const renderCarouselCard = ({ item }) => {
    const locked = isLocked(item.id);
    const peeking = isPeeking(item.id);
    const info = state.lockedApps[item.id];
    const lockTimer = getLockCountdown(item.id);
    const peekTimer = getPeekCountdown(item.id);
    const showX = deleteMode === item.id && !locked && !peeking;

    const peekCost = info ? (info.peekFee || 1) * Math.pow(2, info.peekCount || 0) : 0;

    let statusText = "Unlocked";
    if (peeking) statusText = "Peeking...";
    else if (locked) statusText = `Locked ${getTimeSince(item.id)}`;

    return (
      <WiggleWrap wiggle={showX} style={{ width: CARD_W + CARD_SPACING }}>
      <TouchableOpacity
        style={[styles.carouselCard, NEU_RAISED]}
        activeOpacity={0.9}
        onPress={() => {
          if (deleteMode) {
            setDeleteMode(null);
          } else if (locked) {
            navigation.navigate("Unlock", { appId: item.id });
          }
        }}
        onLongPress={() => {
          if (!locked && !peeking) {
            setDeleteMode(item.id);
            try { Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
          }
        }}
        delayLongPress={500}
      >
        {showX && (
          <TouchableOpacity
            style={styles.deleteX}
            activeOpacity={0.7}
            onPress={() => {
              dispatch({ type: "REMOVE_APP", payload: { appId: item.id } });
              setDeleteMode(null);
            }}
          >
            <Text style={styles.deleteXText}>✕</Text>
          </TouchableOpacity>
        )}
        <AppIcon app={item} size={90} />
        <Text style={styles.cardAppName}>{item.name}</Text>
        <Text style={[styles.cardStatus, peeking && { color: C.gold }]}>
          {statusText}
        </Text>

        {/* Lock timer countdown */}
        {locked && lockTimer && (
          <View style={styles.countdownRow}>
            <Text style={styles.countdownIcon}>T</Text>
            <Text style={styles.countdownText}>{lockTimer}</Text>
          </View>
        )}

        {/* Peek timer countdown */}
        {peeking && peekTimer && (
          <View style={styles.countdownRow}>
            <Text style={styles.countdownIcon}>P</Text>
            <Text style={[styles.countdownText, { color: C.gold }]}>{peekTimer}</Text>
          </View>
        )}

        {/* Fee info for locked apps */}
        {locked && info && (
          <View style={styles.feeInfoWrap}>
            <View style={styles.feeInfoRow}>
              <Text style={styles.feeInfoLabel}>Peek:</Text>
              <Text style={styles.feeInfoValue}>{peekCost}</Text>
              <View style={styles.feeInfoCoin}><Text style={styles.feeInfoCoinP}>P</Text></View>
            </View>
            <View style={styles.feeInfoRow}>
              <Text style={styles.feeInfoLabel}>Full:</Text>
              <Text style={styles.feeInfoValue}>{info.fullFee}</Text>
              <View style={styles.feeInfoCoin}><Text style={styles.feeInfoCoinP}>P</Text></View>
            </View>
          </View>
        )}

        {locked && (
          <GlowButton
            title="Pay Tribute"
            onPress={() => {
              if (deleteMode) { setDeleteMode(null); return; }
              navigation.navigate("Unlock", { appId: item.id });
            }}
            style={{ marginTop: 16 }}
            textStyle={{ fontSize: 14, letterSpacing: 0.8 }}
          />
        )}
        {!locked && !peeking && (
          <GlowButton
            title="Lock Me Back Up"
            onPress={() => {
              if (deleteMode) { setDeleteMode(null); return; }
              dispatch({ type: "RELOCK_APP", payload: { appId: item.id } });
            }}
            style={{ marginTop: 16 }}
            textStyle={{ fontSize: 14, letterSpacing: 0.8 }}
          />
        )}
      </TouchableOpacity>
      </WiggleWrap>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable style={styles.container} onPress={() => deleteMode && setDeleteMode(null)}>
        {/* Coin badge */}
        <View style={styles.header}>
          <View />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("CoinShop")}
          >
            <CoinBadge amount={state.piggyCoins} size="small" />
          </TouchableOpacity>
        </View>

        {/* Pig mascot + tribute clock — compact horizontal */}
        <View style={[styles.pigCard, NEU_RAISED]}>
          <View style={styles.pigMascotWrap}>
            <PigMascot size={70} mood={pigMood} weight={getPigWeight(state.totalCoinsSpent).key} showSpeech />
          </View>
          <View style={styles.tributeClockWrap}>
            <Text style={styles.tributeLabel}>LAST FEEDING</Text>
            <Text style={styles.tributeTime}>{tribute.text}</Text>
            <View style={styles.weightRow}>
              <Text style={styles.weightLabel}>{getPigWeight(state.totalCoinsSpent).label}</Text>
            </View>
            <Text style={styles.moodMsg}>{moodMessage}</Text>
          </View>
        </View>
        {(state.ironSnoutStreak > 0 || state.bestIronSnout > 0) && (
          <View style={[styles.streakCard, NEU_RAISED]}>
            <View style={styles.streakBadge}><Text style={styles.streakBadgeText}>IS</Text></View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakLabel}>IRON SNOUT</Text>
              <Text style={styles.streakValue}>
                {state.ironSnoutStreak} streak{state.ironSnoutStreak !== 1 ? "s" : ""}
              </Text>
            </View>
            {state.bestIronSnout > 0 && (
              <Text style={styles.streakBest}>Best: {state.bestIronSnout}</Text>
            )}
          </View>
        )}
        {lockedApps.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No apps locked</Text>
            <Text style={styles.emptyBody}>
              Your master has nothing to hold over you.{"\n"}That changes now.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("AddApps")}
            >
              <Text style={styles.primaryBtnText}>Lock More Slop</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.carouselWrap}>
            <FlatList
              ref={carouselRef}
              data={lockedApps}
              keyExtractor={(i) => i.id}
              horizontal
              pagingEnabled={false}
              snapToInterval={SNAP_INTERVAL}
              snapToAlignment="start"
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
              onMomentumScrollEnd={onScrollEnd}
              onScrollEndDrag={onScrollEnd}
              renderItem={renderCarouselCard}
              getItemLayout={(_, index) => ({
                length: SNAP_INTERVAL,
                offset: SNAP_INTERVAL * index,
                index,
              })}
            />
            {/* Dots — swipeable like iPhone home screen */}
            {lockedApps.length > 1 && (
              <View
                style={styles.dots}
                {...dotPanResponder.panHandlers}
                onLayout={(e) => { dotsLayoutRef.current = e.nativeEvent.layout; }}
              >
                {lockedApps.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === activeIndex && styles.dotActive]}
                  />
                ))}
              </View>
            )}
            {/* Add more */}
            <TouchableOpacity
              style={styles.addRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("AddApps")}
            >
              <View style={styles.addCircle}>
                <Text style={styles.addPlus}>+</Text>
              </View>
              <Text style={styles.addText}>Lock More Slop</Text>
            </TouchableOpacity>
          </View>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },

  pigCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    marginHorizontal: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    minHeight: 110,
  },
  pigMascotWrap: { width: 100, alignItems: "center", justifyContent: "flex-end" },
  tributeClockWrap: { flex: 1, marginLeft: 16 },
  tributeLabel: { ...T.label, marginBottom: 2 },
  tributeTime: { fontSize: 18, fontWeight: "900", color: C.pink, letterSpacing: -0.5, textTransform: "uppercase" },
  weightRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  weightLabel: { fontSize: 12, fontWeight: "800", color: C.pink, textTransform: "uppercase", letterSpacing: 0.5 },
  moodMsg: { ...T.caption, fontStyle: "italic", marginTop: 3, flexShrink: 1 },

  // Carousel
  carouselWrap: { flex: 1 },
  carouselContent: { paddingLeft: 32, paddingRight: 32 },
  carouselCard: {
    width: CARD_W,
    backgroundColor: C.white,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginRight: CARD_SPACING,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 260,
  },
  deleteX: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteXText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
  },
  cardAppName: { ...T.h1, marginTop: 14, textAlign: "center" },
  cardStatus: { ...T.caption, marginTop: 4 },
  countdownRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  countdownIcon: { fontSize: 12, fontWeight: "900", color: C.pink, marginRight: 6, width: 20, height: 20, lineHeight: 20, textAlign: "center", backgroundColor: C.pinkPale, borderRadius: 10, overflow: "hidden" },
  countdownText: { fontSize: 22, fontWeight: "900", color: C.pink, letterSpacing: 1, fontVariant: ["tabular-nums"] },
  cardFeeRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  cardFeeCoin: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: C.pink,
    alignItems: "center", justifyContent: "center", marginRight: 6,
  },
  cardFeeCoinP: { color: "#FFF", fontSize: 12, fontWeight: "900" },
  cardFeeAmount: { fontSize: 26, fontWeight: "900", color: C.pink, letterSpacing: -0.5 },

  // Fee info (peek/full) on locked cards
  feeInfoWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 16,
  },
  feeInfoRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  feeInfoLabel: { ...T.caption, fontWeight: "600" },
  feeInfoValue: { fontSize: 16, fontWeight: "900", color: C.pink, marginRight: 2 },
  feeInfoCoin: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: C.pink,
    alignItems: "center", justifyContent: "center",
  },
  feeInfoCoinP: { color: "#FFF", fontSize: 9, fontWeight: "900" },

  // Iron Snout streak card
  streakCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    marginHorizontal: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  streakBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.pinkPale, alignItems: "center", justifyContent: "center", marginRight: 10 },
  streakBadgeText: { fontSize: 10, fontWeight: "900", color: C.pink },
  streakInfo: { flex: 1 },
  streakLabel: { ...T.label, color: C.pink, fontSize: 10 },
  streakValue: { fontSize: 16, fontWeight: "900", color: C.text, letterSpacing: -0.5 },
  streakBest: { ...T.caption, fontWeight: "600", color: C.textTertiary },

  // Dots
  dots: { flexDirection: "row", justifyContent: "center", marginTop: 16, paddingVertical: 10, paddingHorizontal: 20 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.pinkPale, marginHorizontal: 4,
  },
  dotActive: { backgroundColor: C.pink, width: 20 },

  addRow: { flexDirection: "row", alignItems: "center", paddingVertical: 16, justifyContent: "center" },
  addCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: C.pinkPale,
    alignItems: "center", justifyContent: "center", marginRight: 10,
  },
  addPlus: { fontSize: 18, color: C.pink, fontWeight: "600" },
  addText: { ...T.body, color: C.pink, fontWeight: "600" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 48 },
  emptyTitle: { ...T.h1, textAlign: "center", marginBottom: 8 },
  emptyBody: { ...T.body, textAlign: "center", lineHeight: 22 },
  primaryBtn: { backgroundColor: C.pink, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 16, marginTop: 24 },
  primaryBtnText: { ...T.button },
});
