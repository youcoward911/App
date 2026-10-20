import React, { useState, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "../context/AppLockContext";
import { getPigWeight, getLevel } from "../utils/pigWeight";
import { C, T, NEU_RAISED } from "../utils/theme";
import { showAlert } from "../components/CustomAlert";
import { getCityLeaderboard, getGlobalLeaderboard, getUserRank, setPigName, getPigName } from "../utils/leaderboard";
import { ensureAuth } from "../utils/firebase";
import { lightTap } from "../utils/haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import PCoin from "../components/PCoin";

export const BOARD_INTRO_KEY = "@scrollpig_board_intro";
const DEMO_UID = "demo-you";

function buildDemoData(myName, myCoins, myUnlocks, mySurrenders) {
  const myWeight = getPigWeight(myCoins).label;
  const myLevel = getLevel(myCoins).level;

  // Fake city users — spread across weight tiers
  const cityEntries = [
    { uid: "u1", pigName: "Greasy Oinker #14", totalCoinsSpent: 8420, totalUnlocks: 312, totalSurrenders: 34, weightLabel: "Legendary" },
    { uid: "u2", pigName: "Sloppy Trotter #67", totalCoinsSpent: 5890, totalUnlocks: 245, totalSurrenders: 27, weightLabel: "Legendary" },
    { uid: "u3", pigName: "Muddy Scroll-Hog #3", totalCoinsSpent: 4210, totalUnlocks: 198, totalSurrenders: 22, weightLabel: "Massive" },
    { uid: "u4", pigName: "Filthy Porker #88", totalCoinsSpent: 2780, totalUnlocks: 134, totalSurrenders: 14, weightLabel: "Massive" },
    { uid: "u5", pigName: "Chunky Slop-Lord #21", totalCoinsSpent: 1950, totalUnlocks: 98, totalSurrenders: 10, weightLabel: "Obese" },
    { uid: "u6", pigName: "Stinky Mud-Roller #55", totalCoinsSpent: 1420, totalUnlocks: 76, totalSurrenders: 8, weightLabel: "Obese" },
    { uid: "u7", pigName: "Wobbly Coin-Pig #9", totalCoinsSpent: 980, totalUnlocks: 52, totalSurrenders: 5, weightLabel: "Fat" },
    { uid: "u8", pigName: "Pudgy Oink-Machine #33", totalCoinsSpent: 720, totalUnlocks: 41, totalSurrenders: 4, weightLabel: "Chubby" },
    { uid: "u9", pigName: "Grimy Feed-Beast #71", totalCoinsSpent: 540, totalUnlocks: 29, totalSurrenders: 3, weightLabel: "Chubby" },
    { uid: "u10", pigName: "Soggy Trough-Face #18", totalCoinsSpent: 380, totalUnlocks: 22, totalSurrenders: 2, weightLabel: "Plump" },
    { uid: "u11", pigName: "Drippy Pay-Pig #45", totalCoinsSpent: 210, totalUnlocks: 14, totalSurrenders: 1, weightLabel: "Plump" },
    { uid: "u12", pigName: "Lumpy Piggy #62", totalCoinsSpent: 85, totalUnlocks: 8, totalSurrenders: 1, weightLabel: "Lean" },
  ];

  // Insert the real user into sorted position
  const me = { uid: DEMO_UID, pigName: myName, totalCoinsSpent: myCoins, totalUnlocks: myUnlocks, totalSurrenders: mySurrenders, weightLabel: myWeight };
  const allCity = [...cityEntries, me].sort((a, b) => b.totalCoinsSpent - a.totalCoinsSpent);

  // Global — bigger fish + some city users
  const globalExtras = [
    { uid: "g1", pigName: "Nasty Wallow-King #1", totalCoinsSpent: 24500, totalUnlocks: 890, totalSurrenders: 98, weightLabel: "Legendary" },
    { uid: "g2", pigName: "Slobbery Hog #99", totalCoinsSpent: 18200, totalUnlocks: 720, totalSurrenders: 80, weightLabel: "Legendary" },
    { uid: "g3", pigName: "Mucky Swine #7", totalCoinsSpent: 14800, totalUnlocks: 612, totalSurrenders: 68, weightLabel: "Legendary" },
    { uid: "g4", pigName: "Scruffy Boar #44", totalCoinsSpent: 11350, totalUnlocks: 498, totalSurrenders: 55, weightLabel: "Legendary" },
    { uid: "g5", pigName: "Gooey Snout #26", totalCoinsSpent: 9100, totalUnlocks: 387, totalSurrenders: 43, weightLabel: "Legendary" },
    { uid: "g7", pigName: "Sweaty Slop-Eater #83", totalCoinsSpent: 7200, totalUnlocks: 291, totalSurrenders: 32, weightLabel: "Legendary" },
    { uid: "g8", pigName: "Grubby Porker #38", totalCoinsSpent: 6100, totalUnlocks: 258, totalSurrenders: 28, weightLabel: "Legendary" },
    { uid: "g10", pigName: "Messy Piglet #52", totalCoinsSpent: 4900, totalUnlocks: 211, totalSurrenders: 23, weightLabel: "Massive" },
    { uid: "g12", pigName: "Mushy Oink-Machine #15", totalCoinsSpent: 3600, totalUnlocks: 165, totalSurrenders: 18, weightLabel: "Massive" },
  ];
  const allGlobal = [...globalExtras, ...allCity].sort((a, b) => b.totalCoinsSpent - a.totalCoinsSpent);
  // Dedupe by uid
  const seen = new Set();
  const globalDeduped = allGlobal.filter((e) => { if (seen.has(e.uid)) return false; seen.add(e.uid); return true; });

  const myRankInCity = allCity.findIndex((e) => e.uid === DEMO_UID) + 1;

  return {
    cityData: { city: "Los Angeles", state: "CA", entries: allCity },
    globalData: globalDeduped,
    userRank: { rank: myRankInCity, city: "Los Angeles", pigName: myName, totalCoinsSpent: myCoins },
  };
}

export default function LeaderboardScreen() {
  const { state } = useAppLock();
  const [tab, setTab] = useState("city");
  const [cityData, setCityData] = useState({ city: "", state: "", entries: [] });
  const [globalData, setGlobalData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uid, setUid] = useState(DEMO_UID);
  const [myName, setMyName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const rebuildDemo = useCallback((name) => {
    const demo = buildDemoData(name, state.totalCoinsSpent, state.totalUnlocks, state.totalSurrenders || 0);
    setCityData(demo.cityData);
    setGlobalData(demo.globalData);
    setUserRank(demo.userRank);
  }, [state.totalCoinsSpent, state.totalUnlocks, state.totalSurrenders]);

  const loadData = useCallback(async () => {
    // Load saved pig name
    let pigName = "Crusty Piglet #42";
    try {
      const stored = await AsyncStorage.getItem("@scrollpig_pigname");
      if (stored) pigName = stored;
    } catch (e) {}
    setMyName(pigName);

    // Try real Firebase leaderboard first
    try {
      const user = await ensureAuth();
      if (user) {
        setUid(user.uid);
        const savedName = await getPigName();
        if (savedName) { pigName = savedName; setMyName(savedName); }

        const [city, global, rank] = await Promise.all([
          getCityLeaderboard(),
          getGlobalLeaderboard(),
          getUserRank(),
        ]);

        // Real data, even a near-empty board, in App Store builds; sample players are dev-only
        const hasData = (city.entries && city.entries.length > 0) || (global && global.length > 0);
        if (hasData || !__DEV__) {
          setCityData(city);
          setGlobalData(global);
          setUserRank(rank);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Firebase leaderboard unavailable, using demo data:", e.message);
    }

    // Never show made-up players to real users: an empty board shows the "be the first" state
    if (!__DEV__) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // Development fallback: demo data seeded with real user stats
    setUid(DEMO_UID);
    rebuildDemo(pigName);
    setLoading(false);
    setRefreshing(false);
  }, [rebuildDemo]);

  useEffect(() => {
    const init = async () => {
      try {
        const { requestLocationPermission } = require("../utils/location");
        await requestLocationPermission();
      } catch (e) {}
      loadData();
    };
    init();
  }, []);

  // Refresh demo data when coins/unlocks change
  useEffect(() => {
    if (uid === DEMO_UID && myName) {
      rebuildDemo(myName);
    }
  }, [state.totalCoinsSpent, state.totalUnlocks, state.totalSurrenders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const onSaveName = async () => {
    const trimmed = nameInput.trim();
    if (trimmed.length < 2 || trimmed.length > 24) {
      showAlert("Oink!", "Name must be 2-24 characters");
      return;
    }
    const badWords = [
      "fuck","shit","ass","bitch","dick","cock","pussy","cunt","nigger","nigga",
      "fag","faggot","retard","whore","slut","rape","nazi","kike","spic","chink",
      "f u c k","s h i t","b i t c h","d i c k","c o c k","p u s s y","c u n t",
      "fu ck","sh it","bi tch","di ck","fck","sht","btch","dck","psy","cnt",
      "f*ck","s*it","b*tch","d*ck","c*ck","p*ssy","c*nt",
      "fuk","fuc","phuck","phuk","sheit","azz","a$$","b!tch","d!ck",
    ];
    const lower = trimmed.toLowerCase().replace(/[^a-z]/g, "");
    const spaced = trimmed.toLowerCase();
    if (badWords.some(w => lower.includes(w.replace(/[^a-z]/g, "")) || spaced.includes(w))) {
      showAlert("Oink!", "That name isn't allowed");
      return;
    }
    lightTap();
    // Save locally
    try { await AsyncStorage.setItem("@scrollpig_pigname", trimmed); } catch (e) {}
    // Try Firebase too
    try { await setPigName(trimmed); } catch (e) {}
    setMyName(trimmed);
    setEditingName(false);
    // Update demo data with new name
    if (uid === DEMO_UID) {
      rebuildDemo(trimmed);
    } else {
      loadData();
    }
  };

  const entries = tab === "city" ? cityData.entries : globalData;

  // Amount column grows to the widest rendered number so the coin icons line up
  const [amountWidth, setAmountWidth] = useState(0);
  useEffect(() => setAmountWidth(0), [tab]);
  const onAmountLayout = (e) => {
    const w = Math.ceil(e.nativeEvent.layout.width);
    setAmountWidth((cur) => (w > cur ? w : cur));
  };

  // Opening the tab (or switching City/Global) glides the list to your own row
  const listRef = useRef(null);
  const pendingScroll = useRef(true);
  const scrollTimer = useRef(null);
  // One-time explainer the first time the Board tab is opened on a fresh install
  // (onboarding marks it "pending"; existing players never get the flag)
  useEffect(() => {
    AsyncStorage.getItem(BOARD_INTRO_KEY).then((val) => {
      if (val !== "pending") return;
      AsyncStorage.setItem(BOARD_INTRO_KEY, "done").catch(() => {});
      setTimeout(() => showAlert(
        "The Pig Board",
        "See how big of a pig you are compared to everyone else. Spend coins, climb the ranks.",
        [{ text: "Oink." }],
        { titleColor: "#F7A0B2", bodyColor: "#2D2D2D" }
      ), 500);
    }).catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => {
    pendingScroll.current = true;
    return () => clearTimeout(scrollTimer.current);
  }, []));
  useEffect(() => { pendingScroll.current = true; }, [tab, uid]);
  useEffect(() => {
    if (!pendingScroll.current || !entries.length || !listRef.current) return;
    const index = entries.findIndex((e) => e.uid === uid);
    if (index < 0) return;
    pendingScroll.current = false;
    listRef.current.scrollToOffset({ offset: 0, animated: false });
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      listRef.current?.scrollToIndex({ index, viewPosition: 0.4, animated: true });
    }, 350);
  });
  const onScrollToIndexFailed = (info) => {
    // Row not rendered yet: jump near it, then glide the rest of the way
    listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
    scrollTimer.current = setTimeout(() => {
      listRef.current?.scrollToIndex({ index: info.index, viewPosition: 0.4, animated: true });
    }, 250);
  };

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
            {isMe ? <Text style={styles.youTag}> (YOU)</Text> : null}
          </Text>
          <Text style={styles.rowSub}>
            {item.weightLabel || getPigWeight(item.totalCoinsSpent || 0).label} · {item.totalSurrenders || 0} surrender{(item.totalSurrenders || 0) === 1 ? "" : "s"}
          </Text>
        </View>
        <View style={styles.coinWrap}>
          <PCoin size={20} style={styles.coinIcon} />
          <Text style={[styles.coinAmount, { minWidth: amountWidth }]} onLayout={onAmountLayout}>{item.totalCoinsSpent || 0}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={C.pink} />
          <Text style={styles.loadingText}>Loading the trough...</Text>
        </View>
      </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={styles.gradient}>
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      {/* Edit pig name */}
      <TouchableOpacity style={[styles.nameCard, NEU_RAISED]} onPress={() => { setNameInput(myName); setEditingName(true); }}>
        <Text style={styles.nameCardText}>Edit Pig Name</Text>
        <Text style={styles.editIcon}>✎</Text>
      </TouchableOpacity>

      {/* Edit name modal */}
      <Modal visible={editingName} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditingName(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Edit Pig Name</Text>
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
          <Text style={[styles.tabText, styles.textOutline, tab === "city" && styles.tabTextActive]}>
            {cityData.city || "City"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "global" && styles.tabActive]}
          onPress={() => setTab("global")}
        >
          <Text style={[styles.tabText, styles.textOutline, tab === "global" && styles.tabTextActive]}>
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
          ref={listRef}
          onScrollToIndexFailed={onScrollToIndexFailed}
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  title: { ...T.hero, color: "#F7A0B2", marginTop: 0, marginBottom: 16, textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },
  sub: { ...T.caption, marginTop: 2, marginBottom: 12 },

  // Loading
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { ...T.caption, marginTop: 12 },

  // Rank card
  rankCard: {
    backgroundColor: C.bg,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  nameCard: {
    backgroundColor: C.bg,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 24,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nameCardText: { fontSize: 14, fontWeight: "700", color: "#2D2D2D" },
  editIcon: { fontSize: 14, color: "#2D2D2D", marginLeft: 6 },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: C.bg,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    // Same border width on both tabs so switching doesn't shift the text
    borderWidth: 3,
    borderColor: "transparent",
  },
  tabActive: { borderColor: "#F7A0B2" },
  tabText: { fontSize: 13, fontWeight: "700", color: "#2D2D2D", textTransform: "uppercase", letterSpacing: 0.5 },
  tabTextActive: { color: "#F7A0B2" },
  textOutline: { textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },

  // List
  list: { paddingHorizontal: 24, paddingBottom: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 6,
    // Same border on every row so your highlighted row isn't taller than the rest
    borderWidth: 2,
    borderColor: "transparent",
  },
  rowMe: {
    borderColor: C.pink,
  },
  rank: { fontSize: 16, fontWeight: "500", width: 34, textAlign: "center", color: "#2D2D2D" },
  rowInfo: { flex: 1, marginLeft: 8 },
  // White outline around the pink name (RN has no text stroke; a tight white glow reads as one)
  rowName: { ...T.bodyBold, fontSize: 14, color: "#F7A0B2", textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },
  youTag: { color: "#2D2D2D", fontWeight: "900" },
  rowNameMe: { color: C.pink },
  rowSub: { ...T.caption, marginTop: 0 },
  coinWrap: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
  coinIcon: { marginRight: 4, marginTop: 1 },
  coinAmount: { fontSize: 18, fontWeight: "900", color: "#F7A0B2", fontVariant: ["tabular-nums"], textAlign: "left", textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },

  // Edit name modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: C.bg,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "900", color: "#2D2D2D", marginBottom: 4 },
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
  cancelBtnText: { fontSize: 14, fontWeight: "700", color: "#2D2D2D" },
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
