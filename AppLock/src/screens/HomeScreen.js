import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
  ScrollView,
  AppState,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "../context/AppLockContext";
import PigMascot from "../components/PigMascot";
import CoinBadge from "../components/CoinBadge";
import SlideToLock from "../components/SwipeToLock";
import LockConfigModal from "../components/LockConfigModal";
import { getStarvingMessage } from "../data/roastMessages";
import { getPigWeight } from "../utils/pigWeight";
import { C, T, NEU_RAISED, NEON_GLOW } from "../utils/theme";
import GlowButton from "../components/GlowButton";
import { showAlert } from "../components/CustomAlert";
import { isScreenTimeAvailable, showAppPicker, showAppPickerForList, blockSelectedApps, blockLists as blockListsNative, deleteBlockList as deleteBlockListNative } from "../native/ScreenTime";
import { heavyTap, successTap, lightTap } from "../utils/haptics";

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

  const hasActiveTimer = lock.isLocked && lock.lockExpiresAt;
  const isPeeking = lock.peekExpiresAt && Date.now() < lock.peekExpiresAt;
  const tributeSecs = state.lastTributeTime ? Math.floor((Date.now() - state.lastTributeTime) / 1000) : Infinity;
  const tickRate = hasActiveTimer || isPeeking || tributeSecs < 60 ? 1000 : 30000;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), tickRate);
    return () => clearInterval(interval);
  }, [tickRate]);

  // Force refresh when app comes back to foreground
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
          // Fallback: try blocking with default list directly
          const fallback = await blockSelectedApps();
          console.log("[LOCK] fallback blockSelectedApps result:", JSON.stringify(fallback));
        }
      } catch (e) {
        console.warn("[LOCK] blockLists failed:", e);
        // Fallback
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header with coin badge */}
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
        <View style={[styles.pigCard, NEU_RAISED]}>
          <View style={styles.pigMascotWrap}>
            <PigMascot size={70} mood={pigMood} weight={getPigWeight(state.totalCoinsSpent).key} showSpeech />
          </View>
          <View style={styles.tributeClockWrap}>
            <Text style={styles.tributeLabel}>LAST FEEDING</Text>
            <Text style={styles.tributeTime}>{tribute.text}</Text>
            {tribute.text !== "Never" && (
              <View style={styles.weightRow}>
                <Text style={styles.weightLabel}>{getPigWeight(state.totalCoinsSpent).label}</Text>
              </View>
            )}
            <Text style={styles.moodMsg}>
              {tribute.text === "Never"
                ? "Aw, what's wrong? Does little piggy need to scroll?"
                : moodMessage}
            </Text>
          </View>
        </View>

        {/* Iron Snout streak */}
        {(state.ironSnoutStreak > 0 || state.bestIronSnout > 0) && (
          <View style={[styles.streakCard, NEU_RAISED]}>
            <View style={styles.streakBadge}><Text style={styles.streakBadgeText}>IS</Text></View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakLabel}>IRON SNOUT</Text>
              <Text style={styles.streakValue}>
                {state.ironSnoutStreak} streak{state.ironSnoutStreak !== 1 ? "s" : ""}
              </Text>
            </View>
            {state.bestIronSnout > 0 && (
              <Text style={styles.streakBest}>Best: {state.bestIronSnout}</Text>
            )}
          </View>
        )}

        {/* Slop Lock Card — takes up remaining space */}
        <View style={[styles.slopCard, NEON_GLOW, lock.isLocked && styles.slopCardActive]}>
          {lock.isLocked ? (
            <>
              <Text style={styles.slopLabel}>SLOP LOCK</Text>
              <Text style={[styles.slopStatus, isPeeking && { color: C.gold }]}>
                {isPeeking ? "PEEKING" : "LOCKED"}
              </Text>

              {isPeeking && peekCountdown ? (
                <Text style={[styles.slopTimer, { color: C.gold }]}>{peekCountdown}</Text>
              ) : lockCountdown ? (
                <Text style={styles.slopTimer}>{lockCountdown}</Text>
              ) : null}

              {lock.appCount > 0 && (
                <Text style={styles.slopAppCount}>
                  {lock.appCount} app{lock.appCount !== 1 ? "s" : ""} blocked
                </Text>
              )}

              <View style={styles.feeRow}>
                {state.isProPig && (
                  <View style={styles.feeChip}>
                    <Text style={styles.feeChipLabel}>Peek</Text>
                    <Text style={styles.feeChipValue}>{peekCost}</Text>
                  </View>
                )}
                <View style={styles.feeChip}>
                  <Text style={styles.feeChipLabel}>Unlock</Text>
                  <Text style={styles.feeChipValue}>{lock.fullFee || 10}</Text>
                </View>
              </View>

              <GlowButton
                title="Surrender"
                onPress={() => navigation.navigate("Unlock")}
                textStyle={{ fontSize: 16, letterSpacing: 1 }}
              />
            </>
          ) : (
            <>
              <Text style={styles.slopLabel}>SLOP LOCK</Text>
              {totalActiveApps > 0 ? (
                <Text style={styles.slopReady}>
                  {totalActiveApps} app{totalActiveApps !== 1 ? "s" : ""} ready to lock
                </Text>
              ) : (
                <Text style={styles.slopReady}>No apps selected yet</Text>
              )}

              <View style={styles.swipeWrap}>
                <SlideToLock onLock={handleSwipeLock} locked={false} />
              </View>
            </>
          )}
        </View>

        {/* Bottom action buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.bottomBtn, NEU_RAISED]}
            activeOpacity={0.8}
            onPress={() => { lightTap(); setShowBlockList(true); }}
          >
            <Text style={styles.bottomBtnIcon}>BLOCK LIST</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomBtn, NEU_RAISED]}
            activeOpacity={0.8}
            onPress={() => { lightTap(); handleScheduleLock(); }}
          >
            <View style={styles.proBadgeSm}><Text style={styles.proBadgeSmText}>PRO</Text></View>
            <Text style={styles.bottomBtnIcon}>SCHEDULE</Text>
          </TouchableOpacity>
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
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: blockListSwipeY }] }]}>
            <View {...blockListPan.panHandlers} style={styles.handleZone}>
              <View style={styles.modalHandle} />
            </View>
            <Text style={styles.modalTitle}>BLOCK LISTS</Text>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {state.blockLists.map((list) => (
                <View key={list.id} style={[styles.listItem, NEU_RAISED]}>
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
              ))}

              {/* Add New List — stays on modal */}
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

  // Pig card
  pigCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    marginHorizontal: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    overflow: "visible",
    zIndex: 10,
    minHeight: 100,
  },
  pigMascotWrap: { width: 100, alignItems: "center", justifyContent: "flex-end", overflow: "visible", zIndex: 10 },
  tributeClockWrap: { flex: 1, marginLeft: 16 },
  tributeLabel: { ...T.label, marginBottom: 2 },
  tributeTime: { fontSize: 18, fontWeight: "900", color: C.pink, letterSpacing: -0.5, textTransform: "uppercase" },
  weightRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  weightLabel: { fontSize: 12, fontWeight: "800", color: C.pink, textTransform: "uppercase", letterSpacing: 0.5 },
  moodMsg: { ...T.caption, marginTop: 3, flexShrink: 1 },

  // Iron Snout streak
  streakCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    marginHorizontal: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  streakBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.pinkPale, alignItems: "center", justifyContent: "center", marginRight: 10 },
  streakBadgeText: { fontSize: 10, fontWeight: "900", color: C.pink },
  streakInfo: { flex: 1 },
  streakLabel: { ...T.label, color: C.pink, fontSize: 10 },
  streakValue: { fontSize: 16, fontWeight: "900", color: C.text, letterSpacing: -0.5 },
  streakBest: { ...T.caption, fontWeight: "600", color: C.textTertiary },

  // Slop Lock card — fills remaining space
  slopCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 24,
    marginHorizontal: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.pink,
    marginBottom: 12,
  },
  slopCardActive: {
    backgroundColor: "#FFF5F7",
  },
  slopLabel: {
    ...T.label,
    color: C.pink,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 4,
  },
  slopStatus: {
    fontSize: 22,
    fontWeight: "900",
    color: C.pink,
    letterSpacing: 2,
  },
  slopTimer: {
    fontSize: 40,
    fontWeight: "900",
    color: C.pink,
    letterSpacing: 2,
    fontVariant: ["tabular-nums"],
    marginTop: 6,
  },
  slopAppCount: {
    ...T.caption,
    marginTop: 6,
    marginBottom: 10,
  },
  slopReady: {
    ...T.body,
    color: C.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  feeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  feeChip: {
    backgroundColor: C.pinkPale,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: "center",
  },
  feeChipLabel: {
    ...T.caption,
    fontSize: 9,
    fontWeight: "700",
  },
  feeChipValue: {
    fontSize: 16,
    fontWeight: "900",
    color: C.pink,
  },
  swipeWrap: {
    alignItems: "center",
    marginTop: 8,
  },

  // Bottom action buttons
  bottomActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  bottomBtn: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  bottomBtnIcon: {
    fontSize: 12,
    fontWeight: "800",
    color: C.pink,
    letterSpacing: 1,
  },
  proBadgeSm: {
    backgroundColor: C.pink,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  proBadgeSmText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // Block List Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handleZone: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "center",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.pinkPale,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.text,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 20,
  },
  listItem: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  listCheckbox: {
    marginRight: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.pinkPale,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: C.pink,
    borderColor: C.pink,
  },
  checkmark: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
  },
  listInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: "800",
    color: C.text,
  },
  listPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  appCountBadge: {
    backgroundColor: C.pink,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  appCountBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "900",
  },
  listItemCount: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textSecondary,
  },
  listItemCountEmpty: {
    fontSize: 12,
    fontWeight: "500",
    color: C.textTertiary,
    marginTop: 4,
  },
  editBtn: {
    backgroundColor: C.pinkPale,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.pink,
  },
  listItemNew: {
    backgroundColor: C.pinkPale,
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: C.pink,
    justifyContent: "center",
    padding: 16,
  },
  listItemNewText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textSecondary,
  },
  proBadge: {
    backgroundColor: C.pink,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 10,
  },
  proBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
