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
import { C, T, CARD_SHADOW, CARD_SHADOW_LG } from "../utils/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 64;
const CARD_SPACING = 12;
const SNAP_INTERVAL = CARD_W + CARD_SPACING;

const NO_TRIBUTE_LINES = [
  "Oink oink, piggy needs to scroll",
  "It's scroll time, isn't it?",
  "My piggy hasn't paid yet. Aw.",
  "The trough is empty, pig.",
];

function getTributeClock(lastTributeTime) {
  if (!lastTributeTime) {
    const line = NO_TRIBUTE_LINES[Math.floor(Math.random() * NO_TRIBUTE_LINES.length)];
    return { text: line, minutes: Infinity };
  }
  const mins = Math.floor((Date.now() - lastTributeTime) / 60000);
  if (mins < 1) return { text: "Just now", minutes: mins };
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

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const tribute = getTributeClock(state.lastTributeTime);
  const pigMood = getPigMood(tribute.minutes);
  const moodMessage = getStarvingMessage(pigMood === "happy" ? "fed" : pigMood === "restless" ? "restless" : pigMood === "dirty" ? "dirty" : "feral");

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
        <TouchableOpacity
          style={styles.unlockBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Unlock", { appId: item.id })}
        >
          <Text style={styles.unlockBtnText}>Pay Tribute</Text>
        </TouchableOpacity>
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

        {/* Pig mascot + tribute clock */}
        <View style={[styles.pigCard, CARD_SHADOW_LG]}>
          <PigMascot size={120} mood={pigMood} />
          <View style={styles.tributeClockWrap}>
            <Text style={styles.tributeLabel}>LAST FEEDING</Text>
            <Text style={[styles.tributeTime, pigMood === "feral" && { color: "#8B2233" }]}>
              {tribute.text}
            </Text>
            <Text style={styles.moodMsg}>{moodMessage}</Text>
          </View>
        </View>

        {lockedApps.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No apps locked, piggy</Text>
            <Text style={styles.emptyBody}>
              Your master has nothing to hold over you.{"\n"}That changes now.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("AddApps")}
            >
              <Text style={styles.primaryBtnText}>Submit Your Apps</Text>
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
              <Text style={styles.addText}>Add More Addictions</Text>
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
    borderRadius: 24,
    marginHorizontal: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  tributeClockWrap: { alignItems: "center", marginTop: 16 },
  tributeLabel: { ...T.label, marginBottom: 4 },
  tributeTime: { fontSize: 22, fontWeight: "900", color: C.pink, letterSpacing: -0.5 },
  moodMsg: { ...T.caption, fontStyle: "italic", marginTop: 6, textAlign: "center", paddingHorizontal: 16 },

  // Carousel
  carouselWrap: { flex: 1 },
  carouselContent: { paddingLeft: 32, paddingRight: 32 },
  carouselCard: {
    width: CARD_W,
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 28,
    marginRight: CARD_SPACING,
    alignItems: "center",
    justifyContent: "center",
  },
  cardAppName: { ...T.h1, marginTop: 16, textAlign: "center" },
  cardStatus: { ...T.caption, marginTop: 6 },
  cardFeeRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  cardFeeCoin: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: C.pink,
    alignItems: "center", justifyContent: "center", marginRight: 8,
  },
  cardFeeCoinP: { color: "#FFF", fontSize: 13, fontWeight: "900" },
  cardFeeAmount: { fontSize: 28, fontWeight: "900", color: C.pink, letterSpacing: -0.5 },
  unlockBtn: {
    backgroundColor: C.pink,
    borderRadius: 16,
    paddingHorizontal: 40,
    paddingVertical: 14,
    marginTop: 20,
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
