import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useAppLock } from "../context/AppLockContext";
import { POPULAR_APPS } from "../data/defaultApps";
import AppIcon from "../components/AppIcon";
import PigMascot from "../components/PigMascot";
import CoinBadge from "../components/CoinBadge";
import { getStarvingMessage } from "../data/roastMessages";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG, NEON_GLOW } from "../utils/theme";
import GlowButton from "../components/GlowButton";

const { width: SCREEN_W } = Dimensions.get("window");
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
  if (minutes < 30) return "happy";
  if (minutes < 120) return "restless";
  if (minutes < 360) return "dirty";
  return "feral";
}

export default function HomeScreen({ navigation }) {
  const { state } = useAppLock();
  const lockedAppIds = Object.keys(state.lockedApps);
  const lockedApps = POPULAR_APPS.filter((a) => lockedAppIds.includes(a.id));
  const [now, setNow] = useState(Date.now());
  const [activeIndex, setActiveIndex] = useState(0);

  // Pick one phrase per app session — useRef so it doesn't change on re-render
  const moodKey = useRef(null);
  const moodMessageRef = useRef(null);

  // Tick every second when under 1 min, otherwise every 30s
  useEffect(() => {
    const tributeSecs = state.lastTributeTime ? Math.floor((Date.now() - state.lastTributeTime) / 1000) : Infinity;
    const rate = tributeSecs < 60 ? 1000 : 30000;
    const interval = setInterval(() => setNow(Date.now()), rate);
    return () => clearInterval(interval);
  }, [now, state.lastTributeTime]);

  const tribute = getTributeClock(state.lastTributeTime);
  const pigMood = getPigMood(tribute.minutes);

  // Only pick a new message if mood category changed or first render
  const currentMoodKey = pigMood === "happy" ? "fed" : pigMood === "restless" ? "restless" : pigMood === "dirty" ? "dirty" : "feral";
  if (moodKey.current !== currentMoodKey) {
    moodKey.current = currentMoodKey;
    moodMessageRef.current = getStarvingMessage(currentMoodKey);
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

  const isLocked = (appId) => !!state.lockedApps[appId]?.lockedAt;

  const onScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setActiveIndex(idx);
  };

  const renderCarouselCard = ({ item }) => {
    const locked = isLocked(item.id);
    const info = state.lockedApps[item.id];
    return (
      <TouchableOpacity
        style={[styles.carouselCard, CARD_SHADOW_LG]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("Unlock", { appId: item.id })}
      >
        <AppIcon app={item} size={90} />
        <Text style={styles.cardAppName}>{item.name}</Text>
        <Text style={styles.cardStatus}>
          {locked ? `Locked ${getTimeSince(item.id)}` : "Unlocked"}
        </Text>
        <View style={styles.cardFeeRow}>
          <View style={styles.cardFeeCoin}>
            <Text style={styles.cardFeeCoinP}>P</Text>
          </View>
          <Text style={styles.cardFeeAmount}>{info?.unlockFee}</Text>
        </View>
        <GlowButton
          title={locked ? "Pay Tribute" : "Lock Me Back Up"}
          onPress={() => navigation.navigate("Unlock", { appId: item.id })}
          style={{ marginTop: 16 }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
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
        <View style={[styles.pigCard, CARD_SHADOW_LG]}>
          <PigMascot size={70} mood={pigMood} />
          <View style={styles.tributeClockWrap}>
            <Text style={styles.tributeLabel}>LAST FEEDING</Text>
            <Text style={styles.tributeTime}>{tribute.text}</Text>
            <Text style={styles.moodMsg}>{moodMessage}</Text>
          </View>
        </View>

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
              data={lockedApps}
              keyExtractor={(i) => i.id}
              horizontal
              pagingEnabled={false}
              snapToInterval={SNAP_INTERVAL}
              snapToAlignment="start"
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
              onScroll={onScroll}
              scrollEventThrottle={16}
              renderItem={renderCarouselCard}
            />
            {/* Dots */}
            {lockedApps.length > 1 && (
              <View style={styles.dots}>
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
      </View>
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
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tributeClockWrap: { flex: 1, marginLeft: 16 },
  tributeLabel: { ...T.label, marginBottom: 2 },
  tributeTime: { fontSize: 18, fontWeight: "900", color: C.pink, letterSpacing: -0.5, textTransform: "uppercase" },
  moodMsg: { ...T.caption, fontStyle: "italic", marginTop: 4, flexShrink: 1 },

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
  cardAppName: { ...T.h1, marginTop: 14, textAlign: "center" },
  cardStatus: { ...T.caption, marginTop: 4 },
  cardFeeRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  cardFeeCoin: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: C.pink,
    alignItems: "center", justifyContent: "center", marginRight: 6,
  },
  cardFeeCoinP: { color: "#FFF", fontSize: 12, fontWeight: "900" },
  cardFeeAmount: { fontSize: 26, fontWeight: "900", color: C.pink, letterSpacing: -0.5 },
  unlockBtn: {
    backgroundColor: C.pink,
    borderRadius: 14,
    paddingHorizontal: 36,
    paddingVertical: 12,
    marginTop: 16,
  },
  unlockBtnText: { ...T.button },

  // Dots
  dots: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
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
