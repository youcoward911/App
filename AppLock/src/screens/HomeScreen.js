import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useAppLock } from "../context/AppLockContext";
import { POPULAR_APPS } from "../data/defaultApps";
import AppIcon from "../components/AppIcon";
import PigMascot from "../components/PigMascot";
import CoinBadge from "../components/CoinBadge";
import { getStarvingMessage } from "../data/roastMessages";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG } from "../utils/theme";

function getTributeClock(lastTributeTime) {
  if (!lastTributeTime) return { text: "Never. Starving.", minutes: Infinity };
  const mins = Math.floor((Date.now() - lastTributeTime) / 60000);
  if (mins < 1) return { text: "Just now", minutes: mins };
  if (mins < 60) return { text: `${mins}m ago`, minutes: mins };
  const h = Math.floor(mins / 60);
  if (h < 24) return { text: `${h}h ${mins % 60}m ago`, minutes: mins };
  const d = Math.floor(h / 24);
  return { text: `${d}d ${h % 24}h ago`, minutes: mins };
}

// Pig gets dirtier and angrier the longer it goes without paying
function getPigMood(minutes) {
  if (minutes < 30) return "happy";       // Just fed — clean, smiling
  if (minutes < 120) return "restless";   // Getting antsy
  if (minutes < 360) return "dirty";      // Mud-covered, angry brows
  return "feral";                          // Filthy, shaking, furious
}

export default function HomeScreen({ navigation }) {
  const { state } = useAppLock();
  const lockedAppIds = Object.keys(state.lockedApps);
  const lockedApps = POPULAR_APPS.filter((a) => lockedAppIds.includes(a.id));
  const [now, setNow] = useState(Date.now());

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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>PayPig</Text>
            <Text style={styles.sub}>Your master is watching.</Text>
          </View>
          <TouchableOpacity
            style={styles.coinBtn}
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
            <Text style={styles.tributeLabel}>LAST TRIBUTE</Text>
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
          <FlatList
            data={lockedApps}
            keyExtractor={(i) => i.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const locked = isLocked(item.id);
              const info = state.lockedApps[item.id];
              return (
                <TouchableOpacity
                  style={[styles.appRow, CARD_SHADOW]}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("Unlock", { appId: item.id })
                  }
                >
                  <AppIcon app={item} size={46} />
                  <View style={styles.appInfo}>
                    <Text style={styles.appName}>{item.name}</Text>
                    <Text style={styles.appMeta}>
                      {locked ? `Locked ${getTimeSince(item.id)}` : "Unlocked"}
                    </Text>
                  </View>
                  <View style={styles.feeWrap}>
                    <View style={styles.feeCoin}>
                      <Text style={styles.feeCoinP}>P</Text>
                    </View>
                    <Text style={styles.appFee}>{info?.unlockFee}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={
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
            }
          />
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
  greeting: { ...T.hero },
  sub: { ...T.caption, marginTop: 2 },
  coinBtn: {},

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

  list: { paddingHorizontal: 24, paddingBottom: 20 },
  appRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.white,
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  appInfo: { flex: 1, marginLeft: 14 },
  appName: { ...T.bodyBold },
  appMeta: { ...T.caption, marginTop: 2 },
  feeWrap: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  feeCoin: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: C.pink,
    alignItems: "center", justifyContent: "center", marginRight: 4,
  },
  feeCoinP: { color: "#FFF", fontSize: 9, fontWeight: "900" },
  appFee: { fontSize: 16, fontWeight: "700", color: C.pink },
  chevron: { fontSize: 20, color: C.textTertiary, fontWeight: "300" },

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
