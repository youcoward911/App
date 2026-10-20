import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPigAnchorY, subscribePigAnchor } from "../utils/pigAnchor";
import { useAppLock } from "../context/AppLockContext";
import PigIdleWebView from "../components/PigIdleWebView";
import NeuBox from "../components/NeuBox";
import XPBar, { XPCount } from "../components/XPBar";
import { getLevel, getNextLevel, getLevelProgress, getXPInLevel, getXPForLevel } from "../utils/pigWeight";
import { lightTap } from "../utils/haptics";
import { showAlert } from "../components/CustomAlert";
import { T } from "../utils/theme";
import ScreenTimeReport from "../components/ScreenTimeReport";
import PinkButton from "../components/PinkButton";

export default function StatsScreen({ navigation }) {
  const { state } = useAppLock();

  // Offset the pig so it sits at exactly the same screen Y as the Home pig (at scroll top)
  const lockerPress = useRef(new Animated.Value(0)).current;
  const lockerScale = lockerPress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });
  const lockerDrop = lockerPress.interpolate({ inputRange: [0, 1], outputRange: [0, 2] });

  const pigRef = useRef(null);
  const naturalY = useRef(null);
  const scrollY = useRef(0);
  const [pigOffset, setPigOffset] = useState(0);
  const offsetRef = useRef(0);
  // Whole pixels and a 1px dead zone: sub-pixel measurements otherwise ping-pong the
  // offset between two values on every re-layout, which shows as the pig vibrating
  const applyAnchor = (anchorY) => {
    if (anchorY == null || naturalY.current == null) return;
    const next = Math.round(anchorY - naturalY.current);
    if (Math.abs(next - offsetRef.current) < 1) return;
    offsetRef.current = next;
    setPigOffset(next);
  };
  // `offset` is the margin committed in the layout being measured. Re-measured on the
  // ScrollView's layout too, since safe-area padding lands on an ancestor.
  const measurePig = () => {
    const offset = offsetRef.current;
    pigRef.current?.measureInWindow((x, y) => {
      naturalY.current = y + scrollY.current - offset;
      applyAnchor(getPigAnchorY());
    });
  };
  useEffect(() => subscribePigAnchor(applyAnchor), []);
  const xp = state.totalCoinsSpent;
  const level = getLevel(xp);
  const nextLevel = getNextLevel(xp);
  const xpProgress = getLevelProgress(xp);
  const xpInLevel = getXPInLevel(xp);
  const xpForLevel = getXPForLevel(xp);

  // tributesToday only resets on the next tribute, so ignore a count from a previous day
  const cavedToday = state.tributesTodayDate === new Date().toDateString() ? state.tributesToday || 0 : 0;
  const tiles = [
    { value: state.totalUnlocks || 0, label: "Total Unlocks" },
    { value: state.totalSurrenders || 0, label: "Surrenders" },
    { value: state.totalPeeks || 0, label: "Total Peeks" },
    { value: state.ironSnoutStreak || 0, suffix: ` / ${state.bestIronSnout || 0} best`, label: "Iron Snout Streak", info: {
      title: "Iron Snout Streak",
      body: "How many locks in a row you've finished without peeking or surrendering. Cave even once and it drops back to 0. The \"best\" number is your all-time record.",
    } },
  ];

  return (
    <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          onLayout={() => measurePig()}
          onScroll={(e) => { scrollY.current = e.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <Text style={styles.title}>SHAME STATS</Text>

          {/* Hero Pig + Level */}
          <View style={styles.heroCard}>
            <Text style={styles.levelBadgeText}>Level {level.level}</Text>

            <View
              ref={pigRef}
              collapsable={false}
              onLayout={() => measurePig()}
              style={{ marginTop: pigOffset }}
            >
              <PigIdleWebView
                level={level.level}
                size={224}
                skin={state.activeSkin || "default"}
              />
            </View>

            <Text style={styles.tierName}>{level.tier}</Text>

            <Pressable
              onPressIn={() => Animated.spring(lockerPress, { toValue: 1, tension: 300, friction: 20, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(lockerPress, { toValue: 0, tension: 200, friction: 8, useNativeDriver: true }).start()}
              onPress={() => { lightTap(); navigation.navigate("PigLocker"); }}
            >
              <Animated.View style={[styles.lockerBtn, { transform: [{ scale: lockerScale }, { translateY: lockerDrop }] }]}>
                <View style={styles.lockerBtnFill}>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]}
                    locations={[0, 0.45, 1]}
                    style={styles.lockerBtnShine}
                    pointerEvents="none"
                  />
                  <Text style={styles.lockerBtnText}>Pig Locker</Text>
                  <Text style={styles.lockerBtnChevron}>›</Text>
                </View>
              </Animated.View>
            </Pressable>
          </View>

          {/* XP Progress Bar */}
          <View style={styles.xpCard}>
            <View style={styles.xpLevelRow}>
              <Text style={styles.xpLevelText}>Lv.{level.level}</Text>
              <XPCount value={xpInLevel} max={xpForLevel} level={level.level} style={styles.xpAmountText} />
              {nextLevel && <Text style={styles.xpLevelText}>Lv.{nextLevel.level}</Text>}
            </View>
            <XPBar progress={xpProgress} level={level.level} height={10} style={styles.xpBar} />
            <Text style={styles.xpRemaining}>
              {nextLevel
                ? `Spend ${nextLevel.xpRequired - xp} more coins to reach ${nextLevel.tier}`
                : "MAX LEVEL"}
            </Text>
          </View>

          {/* Screen Time Report */}
          <ScreenTimeReport style={{ marginBottom: 20 }} />

          {/* Your shame: today's caves up top, all-time tiles below */}
          <Text style={styles.sectionLabel}>YOUR SHAME</Text>
          <View style={styles.heroShame}>
            <View style={styles.heroShameLeft}>
              <Text style={styles.heroShameLabel}>CAVED TODAY</Text>
              <CountUp value={cavedToday} style={styles.heroShameValue} />
              <Text style={styles.heroShameRoast}>{todayRoast(cavedToday)}</Text>
            </View>
          </View>
          {[0, 2].map((row) => (
            <View key={row} style={styles.statsRow}>
              {tiles.slice(row, row + 2).map((t) => <ShameTile key={t.label} {...t} />)}
            </View>
          ))}
          <PinkButton
            title={state.isProPig ? "Weekly Shame Report" : "Weekly Shame Report · PRO"}
            onPress={() => { lightTap(); navigation.navigate("WeeklyReport"); }}
            style={{ marginTop: 6 }}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function todayRoast(n) {
  if (n === 0) return "Clean so far. Suspicious.";
  if (n === 1) return "One slip. We saw that.";
  if (n <= 3) return "Weak.";
  if (n <= 6) return "Pathetic, honestly.";
  return "Fully feral.";
}

// Number that counts up from 0 each time Stats comes into view
function CountUp({ value, style }) {
  const isFocused = useIsFocused();
  const anim = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setShown(Math.round(v)));
    return () => anim.removeListener(id);
  }, []);
  useEffect(() => {
    if (!isFocused) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: value, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [isFocused, value]);
  return <Text style={style}>{shown.toLocaleString()}</Text>;
}

function ShameTile({ value, suffix, label, info }) {
  return (
    <View style={styles.tile}>
      {info && (
        <Pressable
          onPress={() => { lightTap(); showAlert(info.title, info.body, undefined, { titleColor: "#F7A0B2", bodyColor: "#2D2D2D" }); }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`What is ${label}?`}
          style={styles.infoDot}
        >
          {/* Drawn rather than typed so it sits exactly in the middle */}
          <View style={styles.infoI}>
            <View style={styles.infoIDot} />
            <View style={styles.infoIStem} />
          </View>
        </Pressable>
      )}
      <View style={styles.tileValueRow}>
        <CountUp value={value} style={styles.tileValue} />
        {suffix ? <Text style={styles.tileSuffix}>{suffix}</Text> : null}
      </View>
      <View style={styles.tileLabelRow}>
        <Text style={styles.tileLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },

  title: { ...T.hero, color: "#F7A0B2", marginTop: 12, marginBottom: 8, textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },

  heroCard: { alignItems: "center", marginBottom: 8, overflow: "visible" },
  lockerBtn: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: "#F7A0B2",
    shadowColor: "#E97C95",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  lockerBtnFill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 18,
    paddingLeft: 28,
    paddingRight: 22,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    overflow: "hidden",
  },
  lockerBtnShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "75%",
  },
  lockerBtnText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },
  lockerBtnChevron: { fontSize: 22, fontWeight: "600", color: "#FFFFFF", marginTop: -3 },
  levelBadgeGrad: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginBottom: 4 },
  levelBadgeText: { fontSize: 18, fontWeight: "900", color: "#1A1A1A", letterSpacing: 0.3, marginBottom: 4 },
  tierName: { fontSize: 20, fontWeight: "900", color: "#2D2D2D", letterSpacing: -0.5, marginTop: 2, textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },

  xpCard: { marginBottom: 12, paddingHorizontal: 18, paddingVertical: 10 },
  xpHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  xpLabel: { fontSize: 18, fontWeight: "500", color: "#2D2D2D", letterSpacing: -0.8, textTransform: "uppercase" },
  xpValue: { fontSize: 14, fontWeight: "900", color: "#2D2D2D" },
  xpLevelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  xpLevelText: { fontSize: 12, fontWeight: "700", color: "#F7A0B2" },
  xpAmountText: { fontSize: 11, fontWeight: "400", color: "#2D2D2D", letterSpacing: 1 },
  xpBar: { marginTop: 2, marginBottom: 8 },
  xpRemaining: { fontSize: 11, fontWeight: "500", color: "#2D2D2D", textAlign: "center" },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },

  heroShame: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#FFFFFF", borderRadius: 22, paddingVertical: 18, paddingHorizontal: 20, marginBottom: 10,
    borderWidth: 2.5, borderColor: "#F7A0B2",
    shadowColor: "#E97C95", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 12,
  },
  heroShameLeft: { flex: 1 },
  heroShameLabel: { fontSize: 11, fontWeight: "800", color: "#2D2D2D", letterSpacing: 1.6 },
  heroShameValue: {
    fontSize: 56, fontWeight: "900", color: "#F7A0B2", letterSpacing: -2, lineHeight: 60, fontVariant: ["tabular-nums"],
    textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2,
  },
  heroShameRoast: { fontSize: 14, fontWeight: "700", color: "#2D2D2D" },

  tile: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 14,
    shadowColor: "#C9A0B0", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 10,
  },
  tileValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  tileValue: {
    fontSize: 32, fontWeight: "900", color: "#F7A0B2", letterSpacing: -1, fontVariant: ["tabular-nums"],
    textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2,
  },
  tileSuffix: { fontSize: 12, fontWeight: "700", color: "#8A7F84" },
  tileLabelRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  // Pinned to the tile's top-right corner so a long label can't push it out of the tile
  infoDot: {
    position: "absolute", top: 12, right: 12, zIndex: 2,
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.75, borderColor: "#F7A0B2",
    alignItems: "center", justifyContent: "center",
  },
  infoI: { alignItems: "center", justifyContent: "center", gap: 1.5 },
  infoIDot: { width: 2.75, height: 2.75, borderRadius: 1.5, backgroundColor: "#F7A0B2" },
  infoIStem: { width: 2.5, height: 7.5, borderRadius: 1.25, backgroundColor: "#F7A0B2" },
  tileLabel: { fontSize: 11, fontWeight: "700", color: "#2D2D2D", letterSpacing: 0.6, textTransform: "uppercase" },

  sectionLabel: { fontSize: 11, fontWeight: "800", color: "#2D2D2D", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 },
});
