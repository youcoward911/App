import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,

  ScrollView,
  AppState,
  PanResponder,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "../context/AppLockContext";
import PigIdleWebView from "../components/PigIdleWebView";
import PiggyBankIcon from "../components/PiggyBankIcon";
import SlideToLock from "../components/SwipeToLock";
import LockConfigModal from "../components/LockConfigModal";
import NeuBox from "../components/NeuBox";
import { getStarvingMessage } from "../data/roastMessages";
import { getPigWeight, getLevel, getNextLevel, getLevelProgress } from "../utils/pigWeight";
import { C, T, NEU_RAISED, NEON_GLOW } from "../utils/theme";
import GlowButton from "../components/GlowButton";
import { showAlert } from "../components/CustomAlert";
import { isScreenTimeAvailable, showAppPicker, showAppPickerForList, blockSelectedApps, blockLists as blockListsNative, deleteBlockList as deleteBlockListNative } from "../native/ScreenTime";
import AppIconsRow from "../components/AppIconsRow";
import { heavyTap, successTap, lightTap, warningTap } from "../utils/haptics";

const PIG_COIN = require("../../assets/pig-coin.png");
const ICON_SCHEDULE = require("../../assets/icon-schedule.png");

const { width: SCREEN_W } = Dimensions.get("window");

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
  if (minutes < 5) return "dirty";
  if (minutes < 30) return "messy";
  if (minutes < 120) return "restless";
  if (minutes < 360) return "clean";
  return "feral";
}

function formatCountdown(expiresAt) {
  const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  if (remaining <= 0) return null;
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function SwipeToDeleteRow({ children, canDelete, onDelete }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        if (g.dx < 0 && canDelete) translateX.setValue(Math.max(g.dx, -80));
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -50 && canDelete) {
          Animated.spring(translateX, { toValue: -80, tension: 80, friction: 10, useNativeDriver: true }).start();
        } else {
          Animated.spring(translateX, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <View style={{ marginBottom: 10, overflow: "hidden", borderRadius: 16 }}>
      <TouchableOpacity
        style={swipeStyles.deleteReveal}
        onPress={() => {
          Animated.timing(translateX, { toValue: 0, duration: 200, useNativeDriver: true }).start();
          onDelete();
        }}
        activeOpacity={0.8}
      >
        <Text style={swipeStyles.deleteRevealText}>Delete</Text>
      </TouchableOpacity>
      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX }] }}>
        {children}
      </Animated.View>
    </View>
  );
}

const swipeStyles = StyleSheet.create({
  deleteReveal: {
    position: "absolute",
    right: 0, top: 0, bottom: 0, width: 80,
    backgroundColor: "#FF3B30",
    borderTopRightRadius: 16, borderBottomRightRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  deleteRevealText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
});

export default function HomeScreen({ navigation }) {
  const { state, dispatch } = useAppLock();
  const lock = state.slopLock;
  const [now, setNow] = useState(Date.now());
  const [showConfig, setShowConfig] = useState(false);
  const [showBlockList, setShowBlockList] = useState(false);
  const blockListSwipeY = useRef(new Animated.Value(0)).current;
  const blockListPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8,
      onPanResponderMove: (_, g) => { if (g.dy > 0) blockListSwipeY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) {
          setShowBlockList(false);
          setTimeout(() => blockListSwipeY.setValue(0), 300);
        } else {
          Animated.spring(blockListSwipeY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const moodKey = useRef(null);
  const moodMessageRef = useRef(null);

  const pigLevel = getLevel(state.totalCoinsSpent).level;
  const xpProgress = getLevelProgress(state.totalCoinsSpent);
  const nextLvl = getNextLevel(state.totalCoinsSpent);
  const xpNextLabel = nextLvl ? `Lv.${nextLvl.level}` : "MAX";


  const hasActiveTimer = lock.isLocked && lock.lockExpiresAt;
  const isPeeking = lock.peekExpiresAt && Date.now() < lock.peekExpiresAt;
  const tributeSecs = state.lastTributeTime ? Math.floor((Date.now() - state.lastTributeTime) / 1000) : Infinity;
  const tickRate = hasActiveTimer || isPeeking || tributeSecs < 60 ? 1000 : 30000;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), tickRate);
    return () => clearInterval(interval);
  }, [tickRate]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") setNow(Date.now());
    });
    return () => sub.remove();
  }, []);

  const tribute = getTributeClock(state.lastTributeTime);
  const pigMood = getPigMood(tribute.minutes);

  if (moodKey.current !== pigMood) {
    moodKey.current = pigMood;
    moodMessageRef.current = getStarvingMessage(pigMood);
  }
  const moodMessage = moodMessageRef.current;

  const lockCountdown = lock.lockExpiresAt ? formatCountdown(lock.lockExpiresAt) : null;
  const peekCountdown = lock.peekExpiresAt ? formatCountdown(lock.peekExpiresAt) : null;

  const peekCost = lock.isLocked
    ? (lock.peekFee || 1) * Math.pow(2, lock.peekCount || 0)
    : 0;

  const totalActiveApps = (state.blockLists || []).filter((l) => l.isActive).reduce((s, l) => s + l.appCount, 0);

  const handleSwipeLock = async () => {
    heavyTap();
    if (totalActiveApps === 0) {
      if (!isScreenTimeAvailable()) {
        showAlert("No Apps Selected", "You need to select apps to lock first. This requires the full build (TestFlight or App Store).");
        return;
      }
      showAlert("No Apps Selected", "You need to add apps to your block list first.", [
        {
          text: "Add Apps",
          onPress: () => {
            setTimeout(async () => {
              try {
                const result = await showAppPickerForList("default");
                if (result.selectedCount > 0) {
                  dispatch({ type: "SET_APP_COUNT", payload: { listId: "default", count: result.selectedCount } });
                  setShowConfig(true);
                }
              } catch (e) {}
            }, 800);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    setShowConfig(true);
  };

  const handleConfigConfirm = async ({ durationMinutes }) => {
    successTap();
    dispatch({ type: "LOCK_SLOP", payload: { durationMinutes } });
    setShowConfig(false);
    if (isScreenTimeAvailable()) {
      const activeIds = (state.blockLists || []).filter((l) => l.isActive).map((l) => l.id);
      try {
        const result = await blockListsNative(activeIds);
        console.log("[LOCK] blockLists result:", JSON.stringify(result), "listIds:", activeIds);
        if (!result || result.blockedCount === 0) {
          const fallback = await blockSelectedApps();
          console.log("[LOCK] fallback blockSelectedApps result:", JSON.stringify(fallback));
        }
      } catch (e) {
        console.warn("[LOCK] blockLists failed:", e);
        try { await blockSelectedApps(); } catch (e2) {}
      }
    }
  };

  const handleEditApps = async (listId = "default") => {
    if (!isScreenTimeAvailable()) {
      showAlert("Not Available", "App selection requires the full build. Use TestFlight or the App Store version.");
      return;
    }
    try {
      const result = await showAppPickerForList(listId);
      if (result.selectedCount > 0) {
        dispatch({ type: "SET_APP_COUNT", payload: { listId, count: result.selectedCount } });
      }
    } catch (e) {
      showAlert("Error", "Something went wrong opening the app picker.");
    }
  };

  const handleScheduleLock = () => {
    if (state.isProPig) {
      navigation.navigate("Schedules");
    } else {
      showAlert(
        "Pro Pig Required",
        "Upgrade to Pro Pig to schedule automatic locks.",
        [
          { text: "Upgrade", onPress: () => navigation.navigate("Paywall") },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  return (
    <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Coin pill — top right */}
          <View style={styles.header}>
            <Text style={styles.homeTitle}>Scroll Pig</Text>
            <NeuBox style={styles.coinPill} borderRadius={9999} bg="rgba(255,255,255,0.55)" borderColor="rgba(255,255,255,0.5)">
              <TouchableOpacity style={styles.coinPillInner} activeOpacity={0.6} onPress={() => { lightTap(); navigation.navigate("CoinShop"); }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: "rgba(255,144,172,0.4)", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#F7A0B2", fontSize: 11, fontWeight: "300", letterSpacing: 0.5 }}>P</Text>
                </View>
                <Text style={styles.coinAmt}>{state.piggyCoins.toLocaleString()}</Text>
              </TouchableOpacity>
            </NeuBox>
          </View>

          {/* Main content area — pig centered */}
          <View style={styles.mainContent}>
            {/* Glossy CSS pig */}
            <View style={styles.heroWrap}>
              <PigIdleWebView level={Math.min(pigLevel, 5)} size={224} skin={state.activeSkin || "default"} />
            </View>

            {/* XP Level Progress */}
            <View style={styles.xpRow}>
              <Text style={styles.xpLevelText}>Lv.{pigLevel}</Text>
              <View style={styles.xpBarTrack}>
                <View style={[styles.xpBarFill, { width: `${Math.max(2, xpProgress * 100)}%` }]} />
              </View>
              <Text style={styles.xpLevelText}>{xpNextLabel}</Text>
            </View>


            {/* Status text */}
            <View style={styles.statusWrap}>
              {lock.isLocked && (
                <>
                  <Text style={styles.statusText}>
                    {`BLOCKING `}<Text style={styles.statusHighlight}>{lock.appCount || 0}</Text>{` APP${(lock.appCount || 0) !== 1 ? "S" : ""}`}
                  </Text>
                  <Text style={[styles.lockTimer, isPeeking && { color: C.gold }]}>
                    {isPeeking && peekCountdown ? peekCountdown : lockCountdown || "0:00"}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Bottom actions */}
          <View style={styles.bottomActions}>
            {/* Slop list pill */}
            {(totalActiveApps > 0 || !lock.isLocked) && (
              <TouchableOpacity
                style={styles.blockCard}
                activeOpacity={0.6}
                onPress={() => { lightTap(); setShowBlockList(true); }}
              >
                <View style={styles.blockCardLeft}>
                  <Text style={styles.blockCardName}>
                    {totalActiveApps > 0
                      ? (state.blockLists || []).filter(l => l.isActive).map(l => l.name).join(", ")
                      : "Slop List"}
                  </Text>
                  <Text style={styles.blockCardSub}>
                    {totalActiveApps > 0
                      ? `${totalActiveApps} app${totalActiveApps !== 1 ? "s" : ""} ready to block`
                      : "Tap to add apps"}
                  </Text>
                </View>
                <AppIconsRow
                  listId={(state.blockLists || []).find(l => l.isActive)?.id || "default"}
                  maxIcons={3}
                  appCount={totalActiveApps || 4}
                />
              </TouchableOpacity>
            )}
            {lock.isLocked ? (
              <>
                <TouchableOpacity style={styles.surrenderBtn} activeOpacity={0.85} onPress={() => navigation.navigate("Unlock")}>
                  <View style={styles.surrenderDot} />
                  <Text style={styles.surrenderText}>SURRENDER</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.swipeRow}>
                  <SlideToLock onLock={handleSwipeLock} locked={false} />
                </View>
                <NeuBox style={styles.scheduleBtn} borderRadius={24} bg="rgba(255,255,255,0.3)" borderColor="rgba(255,255,255,0.35)">
                  <TouchableOpacity style={styles.scheduleBtnInner} activeOpacity={0.8} onPress={() => { lightTap(); handleScheduleLock(); }}>
                    <Image source={ICON_SCHEDULE} style={styles.scheduleIcon} resizeMode="contain" />
                    <Text style={styles.scheduleText}>Set Auto-Schedule</Text>
                  </TouchableOpacity>
                </NeuBox>
              </>
            )}
          </View>
        </View>

        {/* Lock Config Modal */}
        <LockConfigModal
          visible={showConfig}
          appName="Your Slop"
          onClose={() => setShowConfig(false)}
          onConfirm={handleConfigConfirm}
        />

        {/* Block List Modal */}
        <Modal visible={showBlockList} transparent animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowBlockList(false)}>
            <Animated.View style={[styles.modalSheet, { transform: [{ translateY: blockListSwipeY }] }]} onStartShouldSetResponder={() => true}>
              <View {...blockListPan.panHandlers} style={styles.handleZone}>
                <View style={styles.modalHandle} />
              </View>
              <Text style={styles.modalTitle}>BLOCK LISTS</Text>

              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                {(state.blockLists || []).map((list) => (
                  <SwipeToDeleteRow
                    key={list.id}
                    canDelete={state.blockLists.length > 1}
                    onDelete={() => {
                      warningTap();
                      dispatch({ type: "DELETE_BLOCK_LIST", payload: { id: list.id } });
                      if (isScreenTimeAvailable()) {
                        deleteBlockListNative(list.id).catch(() => {});
                      }
                    }}
                  >
                    <View style={[styles.listItem, NEU_RAISED]}>
                      <TouchableOpacity
                        style={styles.listCheckbox}
                        onPress={() => { lightTap(); dispatch({ type: "TOGGLE_BLOCK_LIST", payload: { id: list.id } }); }}
                      >
                        <View style={[styles.checkbox, list.isActive && styles.checkboxActive]}>
                          {list.isActive && <Text style={styles.checkmark}>{"\u2713"}</Text>}
                        </View>
                      </TouchableOpacity>
                      <View style={styles.listInfo}>
                        <Text style={styles.listItemName}>{list.name}</Text>
                        {list.appCount > 0 ? (
                          <View style={styles.listPreviewRow}>
                            <View style={styles.appCountBadge}>
                              <Text style={styles.appCountBadgeText}>{list.appCount}</Text>
                            </View>
                            <Text style={styles.listItemCount}>
                              app{list.appCount !== 1 ? "s" : ""} blocked
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.listItemCountEmpty}>No apps yet — tap Edit</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => { setShowBlockList(false); setTimeout(() => navigation.navigate("BlockListDetail", { listId: list.id }), 400); }}
                      >
                        <Text style={styles.editBtnText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </SwipeToDeleteRow>
                ))}

                <TouchableOpacity
                  style={[styles.listItem, styles.listItemNew]}
                  activeOpacity={0.8}
                  onPress={() => {
                    lightTap();
                    if (state.isProPig) {
                      const listNum = state.blockLists.length + 1;
                      const newId = `list_${Date.now()}`;
                      const name = `Slop List ${listNum}`;
                      dispatch({ type: "ADD_BLOCK_LIST", payload: { id: newId, name } });
                      setShowBlockList(false);
                      setTimeout(() => navigation.navigate("BlockListDetail", { listId: newId }), 400);
                    } else {
                      setShowBlockList(false);
                      setTimeout(() => {
                        showAlert(
                          "Pro Pig Required",
                          "Upgrade to Pro Pig to create multiple block lists.",
                          [
                            { text: "Upgrade", onPress: () => navigation.navigate("Paywall") },
                            { text: "Cancel", style: "cancel" },
                          ]
                        );
                      }, 400);
                    }
                  }}
                >
                  {!state.isProPig && <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>}
                  <Text style={styles.listItemNewText}>+ New Block List</Text>
                </TouchableOpacity>
              </ScrollView>

              <GlowButton
                title="Done"
                ghost
                onPress={() => setShowBlockList(false)}
                style={{ marginTop: 16 }}
              />
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: { flex: 1 },
  mainContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 16, overflow: "visible" },
  statusWrap: { alignItems: "center" },

  // Header
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8,
    zIndex: 10,
  },
  homeTitle: { ...T.hero, color: "#F7A0B2", marginBottom: 0, textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 },
  coinPill: {},
  coinPillInner: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  coinAmt: { fontSize: 14, fontWeight: "700", color: "#2D2D2D", letterSpacing: -0.35 },

  // Block list card
  blockCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  blockCardLeft: { flex: 1 },
  blockCardName: { fontSize: 15, fontWeight: "700", color: "#F7A0B2", textTransform: "uppercase" },
  blockCardSub: { fontSize: 13, fontWeight: "500", color: "#2D2D2D", marginTop: 2 },
  blockCardIcons: { flexDirection: "row", alignItems: "center", marginLeft: 12 },
  blockCardIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#F0D4DE",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#F7A0B2", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3,
  },
  blockCardIconInner: {
    width: 28, height: 28, borderRadius: 7,
    backgroundColor: "#E8C5CF",
  },
  blockCardIconMore: { backgroundColor: "#F0D4DE" },
  blockCardMoreText: { fontSize: 12, fontWeight: "800", color: "#2D2D2D" },

  // Hero pig — centered
  heroWrap: { alignItems: "center", justifyContent: "center", overflow: "visible", marginTop: -20, marginBottom: 8 },

  // XP bar
  xpRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, marginTop: 12, marginBottom: 12 },
  xpLevelText: { fontSize: 11, fontWeight: "700", color: "#F7A0B2" },
  xpBarTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,122,173,0.18)", overflow: "hidden" },
  xpBarFill: { height: "100%", borderRadius: 3, backgroundColor: "#F7A0B2" },

  // Mode pill
  modePill: { alignSelf: "center", marginBottom: 12 },
  modePillInner: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 24, paddingVertical: 14 },
  modeText: { fontSize: 14, fontWeight: "600", color: "#2D2D2D", letterSpacing: -0.35 },
  modeArrow: { fontSize: 16, color: "#2D2D2D", marginLeft: 4 },

  // Status text
  statusText: { fontSize: 14, fontWeight: "500", color: "#2D2D2D", letterSpacing: 0.35, textAlign: "center", marginBottom: 8 },
  statusHighlight: { color: "#2D2D2D", fontWeight: "700" },

  // Timer
  lockTimer: { fontSize: 56, fontWeight: "900", color: "#2D2D2D", letterSpacing: -2, fontVariant: ["tabular-nums"], textAlign: "center", marginBottom: 8 },

  // Bottom actions
  bottomActions: {
    paddingTop: 8, paddingBottom: 20, paddingHorizontal: 20,
    gap: 10,
  },
  swipeRow: { alignItems: "center", width: "100%" },
  surrenderBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    width: "100%", height: 64, borderRadius: 32,
    shadowColor: "#F7A0B2", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  surrenderDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: "#F7A0B2" },
  surrenderText: { fontSize: 16, fontWeight: "700", color: "#2D2D2D", letterSpacing: 0.5 },

  // Schedule button
  scheduleBtn: { width: "100%" },
  scheduleBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 48 },
  scheduleIcon: { width: 14, height: 16, tintColor: "#2D2D2D" },
  scheduleText: { fontSize: 11, fontWeight: "600", color: "#2D2D2D", letterSpacing: 0.3, textTransform: "uppercase" },

  // Block List Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  handleZone: { paddingTop: 14, paddingBottom: 16, alignItems: "center", width: "100%" },
  modalHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: C.pinkPale },
  modalTitle: { fontSize: 18, fontWeight: "900", color: C.text, letterSpacing: 2, textAlign: "center", marginBottom: 20 },
  listItem: { backgroundColor: C.white, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center" },
  listCheckbox: { marginRight: 12 },
  checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: C.pinkPale, alignItems: "center", justifyContent: "center" },
  checkboxActive: { borderColor: "#2D2D2D" },
  checkmark: { color: "#2D2D2D", fontSize: 14, fontWeight: "900" },
  listInfo: { flex: 1 },
  listItemName: { fontSize: 16, fontWeight: "800", color: C.text },
  listPreviewRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 },
  appCountBadge: { borderWidth: 1.5, borderColor: "#2D2D2D", borderRadius: 10, minWidth: 22, height: 22, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  appCountBadgeText: { color: "#2D2D2D", fontSize: 11, fontWeight: "900" },
  listItemCount: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
  listItemCountEmpty: { fontSize: 12, fontWeight: "500", color: C.textTertiary, marginTop: 4 },
  editBtn: { borderWidth: 1, borderColor: "#F7A0B2", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  editBtnText: { fontSize: 13, fontWeight: "700", color: "#2D2D2D" },
  listItemNew: { borderStyle: "dashed", borderWidth: 1.5, borderColor: "#F7A0B2", justifyContent: "center", padding: 16 },
  listItemNewText: { fontSize: 14, fontWeight: "700", color: C.textSecondary },
  proBadge: { borderWidth: 1, borderColor: "#2D2D2D", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginRight: 10 },
  proBadgeText: { color: "#2D2D2D", fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
});
