import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  PanResponder,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "../context/AppLockContext";
import { C, T, NEU_RAISED, NEU_INSET } from "../utils/theme";
import GlowButton from "../components/GlowButton";
import { showAlert } from "../components/CustomAlert";
import { createSchedule, deleteSchedule as deleteScheduleNative, isScreenTimeAvailable } from "../native/ScreenTime";
import { lightTap, successTap } from "../utils/haptics";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Build time slots in 15-min increments (96 slots: 12:00 AM to 11:45 PM)
const TIME_SLOTS = [];
for (let i = 0; i < 96; i++) {
  const totalMin = i * 15;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const period = h >= 12 ? "PM" : "AM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  TIME_SLOTS.push({
    label: `${display}:${String(m).padStart(2, "0")} ${period}`,
    hour: h,
    minute: m,
  });
}

const WHEEL_ITEM_H = 44;
const WHEEL_VISIBLE = 3;
const WHEEL_H = WHEEL_ITEM_H * WHEEL_VISIBLE;

const formatTime = (h, m) => {
  const period = h >= 12 ? "PM" : "AM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${String(m).padStart(2, "0")} ${period}`;
};

export default function ScheduleScreen({ navigation }) {
  const { state, dispatch } = useAppLock();
  const [showCreate, setShowCreate] = useState(false);
  const createSwipeY = useRef(new Animated.Value(0)).current;
  const createPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8,
      onPanResponderMove: (_, g) => { if (g.dy > 0) createSwipeY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) {
          setShowCreate(false);
          setTimeout(() => createSwipeY.setValue(0), 300);
        } else {
          Animated.spring(createSwipeY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4]); // Mon-Fri
  const [startIdx, setStartIdx] = useState(36); // 9:00 AM
  const [endIdx, setEndIdx] = useState(40);     // 10:00 AM (minimum 1hr after start)
  const startNotchRef = useRef(36);
  const endNotchRef = useRef(40);
  const [selectedListIds, setSelectedListIds] = useState(
    state.blockLists.filter((l) => l.isActive).map((l) => l.id)
  );

  const toggleDay = (idx) => {
    lightTap();
    setSelectedDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx].sort()
    );
  };

  const toggleList = (id) => {
    lightTap();
    setSelectedListIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const onStartScroll = useCallback((e) => {
    const notch = Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM_H);
    if (notch !== startNotchRef.current && notch >= 0 && notch < TIME_SLOTS.length) {
      startNotchRef.current = notch;
      lightTap();
    }
  }, []);

  const onEndScroll = useCallback((e) => {
    const notch = Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM_H);
    if (notch !== endNotchRef.current && notch >= 0 && notch < TIME_SLOTS.length) {
      endNotchRef.current = notch;
      lightTap();
    }
  }, []);

  const handleCreate = async () => {
    if (selectedDays.length === 0) {
      showAlert("Oops", "Pick at least one day.");
      return;
    }
    if (selectedListIds.length === 0) {
      showAlert("Oops", "Pick at least one block list.");
      return;
    }

    const safeStartIdx = Math.max(0, Math.min(startIdx, TIME_SLOTS.length - 1));
    const safeEndIdx = Math.max(0, Math.min(endIdx, TIME_SLOTS.length - 1));
    const startSlot = TIME_SLOTS[safeStartIdx];
    const endSlot = TIME_SLOTS[safeEndIdx];

    // Ensure minimum 1 hour gap
    const startTotal = startSlot.hour * 60 + startSlot.minute;
    const endTotal = endSlot.hour * 60 + endSlot.minute;
    if (endTotal <= startTotal || endTotal - startTotal < 60) {
      showAlert("Too Short", "Schedule must be at least 1 hour long.");
      return;
    }

    const id = `sched_${Date.now()}`;
    const schedule = {
      id,
      name: `${DAYS.filter((_, i) => selectedDays.includes(i)).join(", ")} ${startSlot.label}-${endSlot.label}`,
      listIds: selectedListIds,
      days: selectedDays,
      startHour: startSlot.hour,
      startMin: startSlot.minute,
      endHour: endSlot.hour,
      endMin: endSlot.minute,
      isEnabled: true,
    };

    dispatch({ type: "ADD_SCHEDULE", payload: schedule });

    if (isScreenTimeAvailable()) {
      try {
        await createSchedule(id, startSlot.hour, startSlot.minute, endSlot.hour, endSlot.minute);
      } catch (e) {}
    }

    successTap();
    setShowCreate(false);
    showAlert("Scheduled", "Your lock schedule is set. Apps will auto-lock on schedule.");
  };

  const handleDelete = async (scheduleId) => {
    dispatch({ type: "DELETE_SCHEDULE", payload: { id: scheduleId } });
    if (isScreenTimeAvailable()) {
      try { await deleteScheduleNative(scheduleId); } catch (e) {}
    }
  };

  const handleToggle = async (schedule) => {
    dispatch({ type: "TOGGLE_SCHEDULE", payload: { id: schedule.id } });
    if (isScreenTimeAvailable()) {
      if (schedule.isEnabled) {
        try { await deleteScheduleNative(schedule.id); } catch (e) {}
      } else {
        try { await createSchedule(schedule.id, schedule.startHour, schedule.startMin, schedule.endHour, schedule.endMin); } catch (e) {}
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Done</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SCHEDULES</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {state.schedules.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No Schedules Yet</Text>
            <Text style={styles.emptyBody}>
              Set up automatic locks so your apps lock themselves. Because you clearly can't be trusted.
            </Text>
          </View>
        ) : (
          state.schedules.map((s) => (
            <View key={s.id} style={[styles.scheduleCard, NEU_RAISED]}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleName}>{s.name}</Text>
                <Text style={styles.scheduleLists}>
                  {s.listIds.map((lid) => state.blockLists.find((l) => l.id === lid)?.name || lid).join(", ")}
                </Text>
              </View>
              <Switch
                value={s.isEnabled}
                onValueChange={() => handleToggle(s)}
                trackColor={{ false: C.pinkPale, true: C.pink }}
                thumbColor="#FFF"
              />
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  showAlert("Delete Schedule?", "This can't be undone.", [
                    { text: "Delete", onPress: () => handleDelete(s.id) },
                    { text: "Cancel", style: "cancel" },
                  ]);
                }}
              >
                <Text style={styles.deleteBtnText}>X</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <GlowButton
          title="+ Add Schedule"
          onPress={() => setShowCreate(true)}
          style={{ marginTop: 20 }}
        />
      </ScrollView>

      {/* Create Schedule Modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: createSwipeY }] }]}>
            <View {...createPanResponder.panHandlers} style={styles.handleZone}>
              <View style={styles.modalHandle} />
            </View>
            <Text style={styles.modalTitle}>NEW SCHEDULE</Text>

            {/* Days */}
            <Text style={styles.sectionLabel}>DAYS</Text>
            <View style={styles.daysRow}>
              {DAYS.map((d, i) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayChip, selectedDays.includes(i) && styles.dayChipActive]}
                  onPress={() => toggleDay(i)}
                >
                  <Text style={[styles.dayText, selectedDays.includes(i) && styles.dayTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time Range — scroll wheels */}
            <Text style={styles.sectionLabel}>TIME</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>Start</Text>
                <View style={styles.wheelWrap}>
                  <View style={styles.wheelHighlight} />
                  <ScrollView
                    style={styles.wheel}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={WHEEL_ITEM_H}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingVertical: WHEEL_ITEM_H * Math.floor(WHEEL_VISIBLE / 2) }}
                    onScroll={onStartScroll}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM_H);
                      setStartIdx(Math.max(0, Math.min(idx, TIME_SLOTS.length - 1)));
                    }}
                    onScrollEndDrag={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM_H);
                      setStartIdx(Math.max(0, Math.min(idx, TIME_SLOTS.length - 1)));
                    }}
                    contentOffset={{ x: 0, y: startIdx * WHEEL_ITEM_H }}
                  >
                    {TIME_SLOTS.map((slot, i) => (
                      <View key={i} style={styles.wheelItem}>
                        <Text style={[styles.wheelText, i === startIdx && styles.wheelTextActive]}>{slot.label}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
              <Text style={styles.timeDash}>to</Text>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>End</Text>
                <View style={styles.wheelWrap}>
                  <View style={styles.wheelHighlight} />
                  <ScrollView
                    style={styles.wheel}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={WHEEL_ITEM_H}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingVertical: WHEEL_ITEM_H * Math.floor(WHEEL_VISIBLE / 2) }}
                    onScroll={onEndScroll}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM_H);
                      setEndIdx(Math.max(0, Math.min(idx, TIME_SLOTS.length - 1)));
                    }}
                    onScrollEndDrag={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM_H);
                      setEndIdx(Math.max(0, Math.min(idx, TIME_SLOTS.length - 1)));
                    }}
                    contentOffset={{ x: 0, y: endIdx * WHEEL_ITEM_H }}
                  >
                    {TIME_SLOTS.map((slot, i) => (
                      <View key={i} style={styles.wheelItem}>
                        <Text style={[styles.wheelText, i === endIdx && styles.wheelTextActive]}>{slot.label}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
            <View style={styles.selectedTimeWrap}>
              <Text style={styles.selectedTimeLabel}>SELECTED:</Text>
              <Text style={styles.selectedTimeValue}>{TIME_SLOTS[startIdx]?.label || ""} — {TIME_SLOTS[endIdx]?.label || ""}</Text>
            </View>

            {/* Which lists */}
            <Text style={styles.sectionLabel}>BLOCK LISTS</Text>
            {state.blockLists.map((list) => (
              <TouchableOpacity
                key={list.id}
                style={[styles.listToggle, selectedListIds.includes(list.id) && styles.listToggleActive]}
                onPress={() => toggleList(list.id)}
              >
                <Text style={styles.listToggleName}>{list.name}</Text>
                {selectedListIds.includes(list.id) && (
                  <Text style={styles.listToggleCheck}>{"\u2713"}</Text>
                )}
              </TouchableOpacity>
            ))}

            <View style={{ marginTop: 20 }}>
              <GlowButton title="Create Schedule" onPress={handleCreate} />
              <GlowButton title="Cancel" ghost onPress={() => setShowCreate(false)} />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  back: { fontSize: 16, fontWeight: "600", color: C.pink },
  title: { fontSize: 18, fontWeight: "900", color: C.text, letterSpacing: 2 },
  content: { padding: 24, paddingBottom: 40 },

  empty: { alignItems: "center", paddingTop: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "900", color: C.text, marginBottom: 8 },
  emptyBody: { ...T.caption, textAlign: "center", lineHeight: 18 },

  scheduleCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scheduleInfo: { flex: 1 },
  scheduleName: { fontSize: 14, fontWeight: "800", color: C.text },
  scheduleLists: { fontSize: 12, fontWeight: "500", color: C.textSecondary, marginTop: 2 },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.pinkPale, alignItems: "center", justifyContent: "center",
    marginLeft: 10,
  },
  deleteBtnText: { fontSize: 12, fontWeight: "900", color: C.pink },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    maxHeight: "85%",
  },
  handleZone: { paddingTop: 12, paddingBottom: 8, alignItems: "center" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.pinkPale },
  modalTitle: { fontSize: 18, fontWeight: "900", color: C.text, letterSpacing: 2, textAlign: "center", marginBottom: 20 },

  sectionLabel: { fontSize: 11, fontWeight: "800", color: C.textTertiary, letterSpacing: 1.5, marginTop: 16, marginBottom: 8 },

  // Days
  daysRow: { flexDirection: "row", gap: 6 },
  dayChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: C.pinkPale, alignItems: "center",
  },
  dayChipActive: { backgroundColor: C.pink },
  dayText: { fontSize: 12, fontWeight: "700", color: C.textSecondary },
  dayTextActive: { color: "#FFF" },

  // Time wheels — matches LockConfigModal style
  timeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  timeBlock: { alignItems: "center", flex: 1 },
  timeLabel: { ...T.caption, marginBottom: 6 },
  timeDash: { fontSize: 16, fontWeight: "600", color: C.textSecondary, marginTop: 20 },
  wheelWrap: {
    height: WHEEL_H,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: C.white,
    ...NEU_INSET,
  },
  wheel: {
    height: WHEEL_H,
  },
  wheelItem: {
    height: WHEEL_ITEM_H,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelText: {
    fontSize: 18,
    fontWeight: "600",
    color: C.textTertiary,
    letterSpacing: 0.5,
  },
  wheelTextActive: {
    color: C.pink,
    fontWeight: "900",
    fontSize: 20,
  },
  wheelHighlight: {
    position: "absolute",
    top: WHEEL_ITEM_H * Math.floor(WHEEL_VISIBLE / 2),
    left: 0,
    right: 0,
    height: WHEEL_ITEM_H,
    backgroundColor: "rgba(255,105,180,0.08)",
    borderRadius: 12,
    zIndex: 1,
    pointerEvents: "none",
  },
  selectedTimeWrap: {
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,105,180,0.08)",
    borderRadius: 10,
    alignSelf: "center",
  },
  selectedTimeLabel: { fontSize: 10, fontWeight: "800", color: C.textTertiary, letterSpacing: 1 },
  selectedTimeValue: { fontSize: 16, fontWeight: "900", color: C.pink, marginTop: 2 },

  // List toggles
  listToggle: {
    backgroundColor: C.pinkPale, borderRadius: 12, padding: 14,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 8,
  },
  listToggleActive: { backgroundColor: C.pink },
  listToggleName: { fontSize: 14, fontWeight: "700", color: C.text },
  listToggleCheck: { fontSize: 16, fontWeight: "900", color: "#FFF" },
});
