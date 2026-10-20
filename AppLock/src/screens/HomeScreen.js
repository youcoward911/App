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
  Easing,
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
import PCoin from "../components/PCoin";
import XPBar from "../components/XPBar";
import ScrollPigLogo from "../components/ScrollPigLogo";
import HomeTutorial, { TUTORIAL_KEY } from "../components/HomeTutorial";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPeekCost } from "../utils/peekPricing";
import { getPigWeight, getLevel, getNextLevel, getLevelProgress } from "../utils/pigWeight";
import { C, T, NEU_RAISED, NEON_GLOW } from "../utils/theme";
import GlowButton from "../components/GlowButton";
import { showAlert } from "../components/CustomAlert";
import { isScreenTimeAvailable, showAppPicker, showAppPickerForList, blockSelectedApps, blockLists as blockListsNative, deleteBlockList as deleteBlockListNative, getListCounts } from "../native/ScreenTime";
import AppIconsRow from "../components/AppIconsRow";
import { setPigAnchorY } from "../utils/pigAnchor";
import { heavyTap, successTap, lightTap, warningTap } from "../utils/haptics";

const PIG_COIN = require("../../assets/pig-coin.png");
const ICON_SCHEDULE = require("../../assets/icon-schedule.png");

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

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
        } else {
          Animated.spring(blockListSwipeY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  // Block list sheet: backdrop fades in place while the sheet slides up (and the reverse on close)
  const blockListBackdrop = useRef(new Animated.Value(0)).current;
  const blockListSheetY = useRef(new Animated.Value(SCREEN_H)).current;
  const [blockListMounted, setBlockListMounted] = useState(false);
  useEffect(() => {
    if (showBlockList) {
      setBlockListMounted(true);
      blockListBackdrop.setValue(0);
      blockListSheetY.setValue(SCREEN_H);
      Animated.parallel([
        Animated.timing(blockListBackdrop, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(blockListSheetY, { toValue: 0, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else if (blockListMounted) {
      Animated.parallel([
        Animated.timing(blockListBackdrop, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(blockListSheetY, { toValue: SCREEN_H, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(() => {
        setBlockListMounted(false);
        blockListSwipeY.setValue(0);
      });
    }
  }, [showBlockList]);

  const pigRef = useRef(null);
  // Re-measured on container layout too: safe-area padding lands on an ancestor and
  // shifts the pig on screen without firing the pig's own onLayout
  const measurePig = () => pigRef.current?.measureInWindow((x, y) => setPigAnchorY(y));

  // First-install walkthrough: spotlights each area once, right after onboarding
  const coinRef = useRef(null);
  const xpRef = useRef(null);
  const slopRef = useRef(null);
  const swipeRef = useRef(null);
  const [tutorialSteps, setTutorialSteps] = useState(null);
  useEffect(() => {
    let timer;
    AsyncStorage.getItem(TUTORIAL_KEY).then((val) => {
      if (val !== "pending") return;
      timer = setTimeout(buildTutorial, 900);
    }).catch(() => {});
    return () => clearTimeout(timer);
  }, []);
  const measure = (ref) => new Promise((resolve) => {
    if (!ref.current) return resolve(null);
    ref.current.measureInWindow((x, y, width, height) => resolve(width ? { x, y, width, height } : null));
  });
  const buildTutorial = async () => {
    const [coin, pig, xp, slop, swipe] = await Promise.all([coinRef, pigRef, xpRef, slopRef, swipeRef].map(measure));
    const { width: W, height: H } = Dimensions.get("window");
    const pigArea = pig && xp
      ? { x: 16, y: pig.y, width: W - 32, height: xp.y + xp.height - pig.y }
      : pig;
    const steps = [
      pigArea && { rect: pigArea, title: "Meet your pig", body: "Every coin you spend feeds it. Level up to make it bigger and unlock new skins." },
      coin && { rect: coin, pill: true, title: "Your coins", body: "Opening a blocked app costs coins, so caving actually costs you. Tap here to get more." },
      slop && { rect: slop, title: "Your Slop List", body: "The apps that eat your time. Tap to add or change what gets blocked." },
      swipe && { rect: swipe, pill: true, title: "Swipe to lock", body: "Your apps stay blocked until time's up or until you surrender." },
      { rect: { x: 0, y: H - 85, width: W, height: 85 }, title: "Stats, leaderboard, settings", body: "Track your shame, climb local and global leaderboards, set a custom surrender price, and unlock new pig skins." },
    ].filter(Boolean);
    setTutorialSteps(steps);
  };
  const finishTutorial = () => {
    setTutorialSteps(null);
    AsyncStorage.setItem(TUTORIAL_KEY, "done").catch(() => {});
  };
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
    ? getPeekCost(lock.peekCount || 0, lock.fullFee || state.settings.defaultFullFee, state.isProPig)
    : 0;

  const totalActiveApps = (state.blockLists || []).filter((l) => l.isActive).reduce((s, l) => s + l.appCount, 0);

  // Stored app counts can drift from the native selection (e.g. app state reset on reinstall
  // while iOS keeps the picked apps), so resync them from native. Returns the active total.
  const stateRef = useRef(state);
  stateRef.current = state;
  const listIdsKey = (state.blockLists || []).map((l) => l.id).join(",");

  const syncAppCounts = async () => {
    const lists = stateRef.current.blockLists || [];
    let counts = {};
    try {
      counts = await getListCounts(lists.map((l) => l.id));
    } catch (e) {}
    let total = 0;
    for (const l of lists) {
      const count = counts[l.id] ?? l.appCount;
      if (count !== l.appCount) {
        dispatch({ type: "SET_APP_COUNT", payload: { listId: l.id, count } });
      }
      if (l.isActive) total += count;
    }
    return total;
  };

  useEffect(() => {
    syncAppCounts();
  }, [listIdsKey]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") syncAppCounts();
    });
    return () => sub.remove();
  }, []);

  const handleSwipeLock = async () => {
    heavyTap();
    if (totalActiveApps === 0 && (await syncAppCounts()) === 0) {
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
      if (result.selectedCount >= 0) {
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
        <View style={styles.container} onLayout={measurePig}>
          {/* Coin pill — top right */}
          <View style={styles.header}>
            <ScrollPigLogo height={44} />
            <View ref={coinRef} collapsable={false}>
              <NeuBox style={styles.coinPill} borderRadius={9999} bg="rgba(255,255,255,0.55)" borderColor="rgba(255,255,255,0.5)">
                <TouchableOpacity style={styles.coinPillInner} activeOpacity={0.6} onPress={() => { lightTap(); navigation.navigate("CoinShop"); }}>
                  <PCoin size={24} />
                  <Text style={styles.coinAmt}>{state.piggyCoins.toLocaleString()}</Text>
                </TouchableOpacity>
              </NeuBox>
            </View>
          </View>

          {/* Main content area — pig centered */}
          <View style={styles.mainContent}>
            {/* Glossy CSS pig */}
            <View style={styles.heroWrap}>
              <View
                ref={pigRef}
                collapsable={false}
                onLayout={measurePig}
              >
                <PigIdleWebView level={pigLevel} size={224} skin={state.activeSkin || "default"} />
              </View>
            </View>

            {/* XP Level Progress */}
            <View ref={xpRef} collapsable={false} style={styles.xpRow}>
              <Text style={styles.xpLevelText}>Lv.{pigLevel}</Text>
              <XPBar progress={xpProgress} level={pigLevel} height={8} style={styles.xpBar} />
              <Text style={styles.xpLevelText}>{xpNextLabel}</Text>
            </View>


            {/* Status text */}
            <View style={styles.statusWrap}>
              {lock.isLocked && (
                <>
                  <Text style={styles.statusText}>
                    {isPeeking ? "PEEKING FOR" : (
                      <>
                        {`BLOCKING `}<Text style={styles.statusHighlight}>{lock.appCount || 0}</Text>{` APP${(lock.appCount || 0) !== 1 ? "S" : ""}`}
                      </>
                    )}
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
                ref={slopRef}
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
                  revision={(state.blockLists || []).find(l => l.isActive)?.rev || 0}
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
                <View ref={swipeRef} collapsable={false} style={styles.swipeRow}>
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

        {tutorialSteps && <HomeTutorial steps={tutorialSteps} onDone={finishTutorial} />}

        {/* Lock Config Modal */}
        <LockConfigModal
          visible={showConfig}
          appName="Your Slop"
          onClose={() => setShowConfig(false)}
          onConfirm={handleConfigConfirm}
        />

        {/* Block List Modal */}
        <Modal visible={blockListMounted} transparent animationType="none">
          <View style={styles.modalOverlay}>
            <Animated.View style={[StyleSheet.absoluteFill, styles.modalBackdrop, { opacity: blockListBackdrop }]} />
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowBlockList(false)} />
            <Animated.View style={[styles.modalSheet, { transform: [{ translateY: Animated.add(blockListSheetY, blockListSwipeY) }] }]} onStartShouldSetResponder={() => true}>
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
          </View>
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
  heroWrap: { alignItems: "center", justifyContent: "center", overflow: "visible", marginTop: 0, marginBottom: 8, transform: [{ translateY: 0 }] },

  // XP bar
  xpRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, marginTop: 20, marginBottom: 0 },
  xpLevelText: { fontSize: 11, fontWeight: "700", color: "#F7A0B2" },
  xpBar: { flex: 1 },

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
  surrenderDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF3B30",
    shadowColor: "#FF3B30", shadowOpacity: 0.9, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
  },
  surrenderText: { fontSize: 16, fontWeight: "700", color: "#2D2D2D", letterSpacing: 0.5 },

  // Schedule button
  scheduleBtn: { width: "100%" },
  scheduleBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 48 },
  scheduleIcon: { width: 14, height: 16, tintColor: "#2D2D2D" },
  scheduleText: { fontSize: 11, fontWeight: "600", color: "#2D2D2D", letterSpacing: 0.3, textTransform: "uppercase" },

  // Block List Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { backgroundColor: "rgba(0,0,0,0.4)" },
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
  listItemName: { fontSize: 15, fontWeight: "700", color: "#F7A0B2", textTransform: "uppercase" },
  listPreviewRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 },
  appCountBadge: { borderWidth: 1.5, borderColor: "#2D2D2D", borderRadius: 10, minWidth: 22, height: 22, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  appCountBadgeText: { color: "#2D2D2D", fontSize: 11, fontWeight: "900" },
  listItemCount: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
  listItemCountEmpty: { fontSize: 12, fontWeight: "500", color: C.textTertiary, marginTop: 4 },
  editBtn: { borderWidth: 1, borderColor: "#F7A0B2", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  editBtnText: { fontSize: 13, fontWeight: "700", color: "#2D2D2D" },
  listItemNew: { borderStyle: "dashed", borderWidth: 1.5, borderColor: "#F7A0B2", justifyContent: "center", padding: 16 },
  listItemNewText: { fontSize: 14, fontWeight: "700", color: C.textSecondary },
  proBadge: { borderWidth: 1, borderColor: "#F7A0B2", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginRight: 10 },
  proBadgeText: { color: "#F7A0B2", fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
});
