import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "../context/AppLockContext";
import { C, T, NEU_RAISED } from "../utils/theme";
import GlowButton from "../components/GlowButton";
import { showAlert } from "../components/CustomAlert";
import { createSchedule, deleteSchedule as deleteScheduleNative, isScreenTimeAvailable } from "../native/ScreenTime";
import { lightTap, successTap } from "../utils/haptics";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatTime = (h, m) => {
  const period = h >= 12 ? "PM" : "AM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${String(m).padStart(2, "0")} ${period}`;
};

export default function ScheduleScreen({ navigation }) {
  const { state, dispatch } = useAppLock();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4]); // Mon-Fri
  const [startHour, setStartHour] = useState(9);
  const [startMin, setStartMin] = useState(0);
  const [endHour, setEndHour] = useState(17);
  const [endMin, setEndMin] = useState(0);
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

  const adjustTime = (setter, current, delta, max) => {
    lightTap();
    let next = current + delta;
    if (next < 0) next = max;
    if (next > max) next = 0;
    setter(next);
  };

  const handleCreate = async () => {
    if (selectedDays.length === 0) {
      showAlert("Oops", "Pick at least one day.");
      return;
    }
    if (selectedListIds.length === 0) {
      showAlert("Oops", "Pick at least one block list.");
      return;
    }

    const id = `sched_${Date.now()}`;
    const schedule = {
      id,
      name: `${DAYS.filter((_, i) => selectedDays.includes(i)).join(", ")} ${formatTime(startHour, startMin)}-${formatTime(endHour, endMin)}`,
      listIds: selectedListIds,
      days: selectedDays,
      startHour,
      startMin,
      endHour,
      endMin,
      isEnabled: true,
    };

    dispatch({ type: "ADD_SCHEDULE", payload: schedule });

    if (isScreenTimeAvailable()) {
      try {
        await createSchedule(id, startHour, startMin, endHour, endMin);
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
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
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

            {/* Time Range */}
            <Text style={styles.sectionLabel}>TIME</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>Start</Text>
                <View style={styles.timeControls}>
                  <TouchableOpacity onPress={() => adjustTime(setStartHour, startHour, -1, 23)}>
                    <Text style={styles.timeArrow}>{"\u25B2"}</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>{formatTime(startHour, startMin)}</Text>
                  <TouchableOpacity onPress={() => adjustTime(setStartHour, startHour, 1, 23)}>
                    <Text style={styles.timeArrow}>{"\u25BC"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.timeDash}>to</Text>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>End</Text>
                <View style={styles.timeControls}>
                  <TouchableOpacity onPress={() => adjustTime(setEndHour, endHour, -1, 23)}>
                    <Text style={styles.timeArrow}>{"\u25B2"}</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>{formatTime(endHour, endMin)}</Text>
                  <TouchableOpacity onPress={() => adjustTime(setEndHour, endHour, 1, 23)}>
                    <Text style={styles.timeArrow}>{"\u25BC"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
          </View>
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
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.pinkPale, alignSelf: "center", marginBottom: 16 },
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

  // Time
  timeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  timeBlock: { alignItems: "center" },
  timeLabel: { ...T.caption, marginBottom: 6 },
  timeControls: { alignItems: "center" },
  timeArrow: { fontSize: 16, color: C.pink, fontWeight: "800", padding: 4 },
  timeValue: { fontSize: 20, fontWeight: "900", color: C.text, paddingVertical: 4 },
  timeDash: { fontSize: 16, fontWeight: "600", color: C.textSecondary },

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
