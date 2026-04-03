import React from "react";
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
import PigMascot, { PigIcon } from "../components/PigMascot";
import CoinBadge from "../components/CoinBadge";
import { C, T, CARD_SHADOW } from "../utils/theme";

export default function HomeScreen({ navigation }) {
  const { state } = useAppLock();
  const lockedAppIds = Object.keys(state.lockedApps);
  const lockedApps = POPULAR_APPS.filter((a) => lockedAppIds.includes(a.id));

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
            <Text style={styles.sub}>You're owned. Accept it.</Text>
          </View>
          <TouchableOpacity
            style={styles.coinBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("CoinShop")}
          >
            <CoinBadge amount={state.piggyCoins} size="small" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, CARD_SHADOW]}>
            <Text style={styles.statNum}>{lockedApps.length}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
          <View style={[styles.statCard, CARD_SHADOW]}>
            <Text style={styles.statNum}>{state.totalUnlocks}</Text>
            <Text style={styles.statLabel}>Obeyed</Text>
          </View>
          <View style={[styles.statCard, CARD_SHADOW]}>
            <Text style={[styles.statNum, { color: C.pink }]}>
              {state.totalCoinsSpent}
            </Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
        </View>

        {lockedApps.length === 0 ? (
          <View style={styles.empty}>
            <PigMascot size={100} />
            <Text style={styles.emptyTitle}>Nothing locked yet</Text>
            <Text style={styles.emptyBody}>
              Pretending you have self control?{"\n"}We both know what you are.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("AddApps")}
            >
              <Text style={styles.primaryBtnText}>Admit You're Addicted</Text>
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
    paddingBottom: 16,
  },
  greeting: { ...T.hero },
  sub: { ...T.caption, marginTop: 2 },
  coinBtn: {},

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  statNum: { ...T.stat, fontSize: 22 },
  statLabel: { ...T.caption, marginTop: 4 },

  // List
  list: { paddingHorizontal: 24, paddingBottom: 20 },
  appRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  appInfo: { flex: 1, marginLeft: 14 },
  appName: { ...T.bodyBold },
  appMeta: { ...T.caption, marginTop: 2 },
  feeWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  feeCoin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  feeCoinP: { color: "#FFF", fontSize: 9, fontWeight: "900" },
  appFee: {
    fontSize: 16,
    fontWeight: "700",
    color: C.pink,
  },
  chevron: {
    fontSize: 20,
    color: C.textTertiary,
    fontWeight: "300",
  },

  // Add row
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    justifyContent: "center",
  },
  addCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.pinkPale,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  addPlus: { fontSize: 18, color: C.pink, fontWeight: "600" },
  addText: { ...T.body, color: C.pink, fontWeight: "600" },

  // Empty
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 48,
  },
  emptyTitle: { ...T.h1, textAlign: "center", marginBottom: 8, marginTop: 20 },
  emptyBody: { ...T.body, textAlign: "center", lineHeight: 22 },
  primaryBtn: {
    backgroundColor: C.pink,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginTop: 24,
  },
  primaryBtnText: { ...T.button },
});
