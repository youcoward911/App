import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, T, NEU_RAISED } from "../utils/theme";
import { getCityLeaderboard, getGlobalLeaderboard, getUserRank } from "../utils/leaderboard";
import { ensureAuth } from "../utils/firebase";

export default function LeaderboardScreen() {
  const [tab, setTab] = useState("city"); // "city" or "global"
  const [cityData, setCityData] = useState({ city: "", state: "", entries: [] });
  const [globalData, setGlobalData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uid, setUid] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const user = await ensureAuth();
      if (user) setUid(user.uid);

      const [city, global, rank] = await Promise.all([
        getCityLeaderboard(),
        getGlobalLeaderboard(),
        getUserRank(),
      ]);

      setCityData(city);
      setGlobalData(global);
      setUserRank(rank);
    } catch (e) {
      console.warn("Leaderboard load error:", e);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const entries = tab === "city" ? cityData.entries : globalData;

  const renderEntry = ({ item, index }) => {
    const isMe = item.uid === uid;
    const rank = index + 1;
    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;

    return (
      <View style={[styles.row, NEU_RAISED, isMe && styles.rowMe]}>
        <Text style={styles.rank}>{medal}</Text>
        <View style={styles.rowInfo}>
          <Text style={[styles.rowName, isMe && styles.rowNameMe]}>
            {item.pigName || "Anonymous Pig"}
            {isMe ? " (YOU)" : ""}
          </Text>
          <Text style={styles.rowSub}>
            {item.totalUnlocks || 0} tribute{item.totalUnlocks === 1 ? "" : "s"}
          </Text>
        </View>
        <View style={styles.coinWrap}>
          <View style={styles.coinIcon}><Text style={styles.coinP}>P</Text></View>
          <Text style={styles.coinAmount}>{item.totalCoinsSpent || 0}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={C.pink} />
          <Text style={styles.loadingText}>Loading the trough...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.sub}>Who's the most shameless?</Text>
      </View>

      {/* Your rank card */}
      {userRank && (
        <View style={[styles.rankCard, NEU_RAISED]}>
          <Text style={styles.rankLabel}>YOUR RANK</Text>
          <Text style={styles.rankNum}>#{userRank.rank}</Text>
          <Text style={styles.rankCity}>in {userRank.city}</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "city" && styles.tabActive]}
          onPress={() => setTab("city")}
        >
          <Text style={[styles.tabText, tab === "city" && styles.tabTextActive]}>
            {cityData.city || "City"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "global" && styles.tabActive]}
          onPress={() => setTab("global")}
        >
          <Text style={[styles.tabText, tab === "global" && styles.tabTextActive]}>
            Global
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {entries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No one here yet</Text>
          <Text style={styles.emptyBody}>
            {tab === "city"
              ? "Be the first in your city. Pay some tributes."
              : "The trough is empty. Start feeding."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item, i) => item.uid || `${i}`}
          renderItem={renderEntry}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.pink} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 24, paddingTop: 12 },
  title: { ...T.hero },
  sub: { ...T.caption, marginTop: 2, marginBottom: 12 },

  // Loading
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { ...T.caption, marginTop: 12 },

  // Rank card
  rankCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  rankLabel: { ...T.label, marginBottom: 4 },
  rankNum: { fontSize: 40, fontWeight: "900", color: C.pink, letterSpacing: -2 },
  rankCity: { ...T.caption, marginTop: 4 },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: C.white,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: { backgroundColor: C.pink },
  tabText: { fontSize: 13, fontWeight: "700", color: C.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  tabTextActive: { color: "#FFF" },

  // List
  list: { paddingHorizontal: 24, paddingBottom: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  rowMe: {
    borderWidth: 2,
    borderColor: C.pink,
    backgroundColor: "#FFF5FA",
  },
  rank: { fontSize: 18, fontWeight: "900", width: 36, textAlign: "center" },
  rowInfo: { flex: 1, marginLeft: 8 },
  rowName: { ...T.bodyBold, fontSize: 14 },
  rowNameMe: { color: C.pink },
  rowSub: { ...T.caption, marginTop: 2 },
  coinWrap: { flexDirection: "row", alignItems: "center" },
  coinIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  coinP: { color: "#FFF", fontSize: 10, fontWeight: "900" },
  coinAmount: { fontSize: 18, fontWeight: "900", color: C.pink },

  // Empty
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 48 },
  emptyTitle: { ...T.h2, textAlign: "center", marginBottom: 8 },
  emptyBody: { ...T.body, textAlign: "center", lineHeight: 22 },
});
