import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPigWeight } from "../utils/pigWeight";
import { C, T, NEU_RAISED } from "../utils/theme";
import { getCityLeaderboard, getGlobalLeaderboard, getUserRank, setPigName, getPigName } from "../utils/leaderboard";
import { ensureAuth } from "../utils/firebase";

// ── DEMO MODE: set to false after taking screenshots ──
const DEMO_MODE = false;

const DEMO_CITY = "Los Angeles";
const DEMO_UID = "demo-you";

const DEMO_CITY_DATA = {
  city: DEMO_CITY,
  state: "CA",
  entries: [
    { uid: "u1", pigName: "Greasy Oinker #14", totalCoinsSpent: 8420, totalUnlocks: 312, weightLabel: "Legendary" },
    { uid: "u2", pigName: "Sloppy Trotter #67", totalCoinsSpent: 5890, totalUnlocks: 245, weightLabel: "Legendary" },
    { uid: "u3", pigName: "Muddy Scroll-Hog #3", totalCoinsSpent: 4210, totalUnlocks: 198, weightLabel: "Massive" },
    { uid: DEMO_UID, pigName: "Crusty Piglet #42", totalCoinsSpent: 3150, totalUnlocks: 147, weightLabel: "Massive" },
    { uid: "u4", pigName: "Filthy Porker #88", totalCoinsSpent: 2780, totalUnlocks: 134, weightLabel: "Massive" },
    { uid: "u5", pigName: "Chunky Slop-Lord #21", totalCoinsSpent: 1950, totalUnlocks: 98, weightLabel: "Obese" },
    { uid: "u6", pigName: "Stinky Mud-Roller #55", totalCoinsSpent: 1420, totalUnlocks: 76, weightLabel: "Obese" },
    { uid: "u7", pigName: "Wobbly Coin-Pig #9", totalCoinsSpent: 980, totalUnlocks: 52, weightLabel: "Fat" },
    { uid: "u8", pigName: "Pudgy Oink-Machine #33", totalCoinsSpent: 720, totalUnlocks: 41, weightLabel: "Chubby" },
    { uid: "u9", pigName: "Grimy Feed-Beast #71", totalCoinsSpent: 540, totalUnlocks: 29, weightLabel: "Chubby" },
    { uid: "u10", pigName: "Soggy Trough-Face #18", totalCoinsSpent: 380, totalUnlocks: 22, weightLabel: "Plump" },
    { uid: "u11", pigName: "Drippy Pay-Pig #45", totalCoinsSpent: 210, totalUnlocks: 14, weightLabel: "Plump" },
    { uid: "u12", pigName: "Lumpy Piggy #62", totalCoinsSpent: 85, totalUnlocks: 8, weightLabel: "Lean" },
  ],
};

const DEMO_GLOBAL_DATA = [
  { uid: "g1", pigName: "Nasty Wallow-King #1", totalCoinsSpent: 24500, totalUnlocks: 890, weightLabel: "Legendary" },
  { uid: "g2", pigName: "Slobbery Hog #99", totalCoinsSpent: 18200, totalUnlocks: 720, weightLabel: "Legendary" },
  { uid: "g3", pigName: "Mucky Swine #7", totalCoinsSpent: 14800, totalUnlocks: 612, weightLabel: "Legendary" },
  { uid: "g4", pigName: "Scruffy Boar #44", totalCoinsSpent: 11350, totalUnlocks: 498, weightLabel: "Legendary" },
  { uid: "g5", pigName: "Gooey Snout #26", totalCoinsSpent: 9100, totalUnlocks: 387, weightLabel: "Legendary" },
  { uid: "g6", pigName: "Greasy Oinker #14", totalCoinsSpent: 8420, totalUnlocks: 312, weightLabel: "Legendary" },
  { uid: "g7", pigName: "Sweaty Slop-Eater #83", totalCoinsSpent: 7200, totalUnlocks: 291, weightLabel: "Legendary" },
  { uid: "g8", pigName: "Grubby Porker #38", totalCoinsSpent: 6100, totalUnlocks: 258, weightLabel: "Legendary" },
  { uid: "g9", pigName: "Sloppy Trotter #67", totalCoinsSpent: 5890, totalUnlocks: 245, weightLabel: "Legendary" },
  { uid: "g10", pigName: "Messy Piglet #52", totalCoinsSpent: 4900, totalUnlocks: 211, weightLabel: "Massive" },
  { uid: "g11", pigName: "Muddy Scroll-Hog #3", totalCoinsSpent: 4210, totalUnlocks: 198, weightLabel: "Massive" },
  { uid: "g12", pigName: "Mushy Oink-Machine #15", totalCoinsSpent: 3600, totalUnlocks: 165, weightLabel: "Massive" },
  { uid: DEMO_UID, pigName: "Crusty Piglet #42", totalCoinsSpent: 3150, totalUnlocks: 147, weightLabel: "Massive" },
  { uid: "g13", pigName: "Filthy Porker #88", totalCoinsSpent: 2780, totalUnlocks: 134, weightLabel: "Massive" },
  { uid: "g14", pigName: "Chunky Slop-Lord #21", totalCoinsSpent: 1950, totalUnlocks: 98, weightLabel: "Obese" },
];

export default function LeaderboardScreen() {
  const [tab, setTab] = useState("city"); // "city" or "global"
  const [cityData, setCityData] = useState({ city: "", state: "", entries: [] });
  const [globalData, setGlobalData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uid, setUid] = useState(null);
  const [myName, setMyName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const loadData = useCallback(async () => {
    if (DEMO_MODE) {
      setUid(DEMO_UID);
      setMyName("Crusty Piglet #42");
      setCityData(DEMO_CITY_DATA);
      setGlobalData(DEMO_GLOBAL_DATA);
      setUserRank({ rank: 4, city: DEMO_CITY, pigName: "Crusty Piglet #42", totalCoinsSpent: 3150 });
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const user = await ensureAuth();
      if (user) setUid(user.uid);

      const pigName = await getPigName();
      setMyName(pigName);

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

  const onSaveName = async () => {
    const result = await setPigName(nameInput);
    if (result.ok) {
      setMyName(nameInput.trim());
      setEditingName(false);
      loadData(); // refresh leaderboard with new name
    } else {
      Alert.alert("Oink!", result.error);
    }
  };

  const entries = tab === "city" ? cityData.entries : globalData;

  const renderEntry = ({ item, index }) => {
    const isMe = item.uid === uid;
    const rank = index + 1;
    const medal = `${rank}.`;

    return (
      <View style={[styles.row, NEU_RAISED, isMe && styles.rowMe]}>
        <Text style={styles.rank}>{medal}</Text>
        <View style={styles.rowInfo}>
          <Text style={[styles.rowName, isMe && styles.rowNameMe]}>
            {item.pigName || "Anonymous Pig"}
            {isMe ? " (YOU)" : ""}
          </Text>
          <Text style={styles.rowSub}>
            {item.weightLabel || getPigWeight(item.totalCoinsSpent || 0).label} · {item.totalUnlocks || 0} tribute{(item.totalUnlocks || 0) === 1 ? "" : "s"}
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
        <Text style={styles.sub}>Who's the biggest piggy?</Text>
      </View>

      {/* Your rank card */}
      {userRank && (
        <View style={[styles.rankCard, NEU_RAISED]}>
          <TouchableOpacity style={styles.nameRow} onPress={() => { setNameInput(myName); setEditingName(true); }}>
            <Text style={styles.myName} numberOfLines={1}>{myName}</Text>
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
          <Text style={styles.rankLabel}>YOUR RANK</Text>
          <Text style={styles.rankNum}>#{userRank.rank}</Text>
          <Text style={styles.rankCity}>in {userRank.city}</Text>
        </View>
      )}

      {/* Edit name modal */}
      <Modal visible={editingName} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditingName(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Edit Pig Name</Text>
              <Text style={styles.modalSub}>Keep it clean or face the trough.</Text>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                maxLength={24}
                placeholder="Enter pig name..."
                placeholderTextColor="#CCC"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={onSaveName}
              />
              <Text style={styles.charCount}>{nameInput.length}/24</Text>
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingName(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={onSaveName}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

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
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  myName: { fontSize: 16, fontWeight: "800", color: C.text, flexShrink: 1 },
  editIcon: { fontSize: 16, color: C.pink, marginLeft: 8 },
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
    marginRight: 4,
    marginTop: 1,
  },
  coinP: { color: "#FFF", fontSize: 10, fontWeight: "900" },
  coinAmount: { fontSize: 18, fontWeight: "900", color: C.pink },

  // Edit name modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "900", color: C.text, marginBottom: 4 },
  modalSub: { ...T.caption, marginBottom: 16 },
  nameInput: {
    width: "100%",
    borderWidth: 2,
    borderColor: C.pinkPale,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
  },
  charCount: { ...T.caption, marginTop: 4, alignSelf: "flex-end" },
  modalBtns: { flexDirection: "row", marginTop: 16, gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.pinkPale,
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "700", color: C.pink },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.pink,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 14, fontWeight: "700", color: "#FFF" },

  // Empty
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 48 },
  emptyTitle: { ...T.h2, textAlign: "center", marginBottom: 8 },
  emptyBody: { ...T.body, textAlign: "center", lineHeight: 22 },
});
