import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppLock } from "../context/AppLockContext";
import { POPULAR_APPS, CATEGORIES } from "../data/defaultApps";
import AppIcon from "../components/AppIcon";
import SlideToLock from "../components/SwipeToLock";
import LockConfigModal from "../components/LockConfigModal";
import { C, T, NEU_RAISED } from "../utils/theme";

export default function AddAppsScreen({ navigation }) {
  const { state, dispatch } = useAppLock();
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [configApp, setConfigApp] = useState(null); // app being configured
  const filtered =
    selectedCategory === "All"
      ? POPULAR_APPS
      : POPULAR_APPS.filter((a) => a.category === selectedCategory)
          .sort((a, b) => a.name.localeCompare(b.name));

  const isLocked = (id) => id in state.lockedApps;

  const handleSwipeComplete = async (app) => {
    setConfigApp(app);
  };

  const handleConfigConfirm = async ({ durationMinutes }) => {
    if (!configApp) return;
    const peekFee = state.settings.defaultPeekFee;
    const fullFee = state.settings.defaultFullFee;

    dispatch({
      type: "LOCK_APP",
      payload: {
        appId: configApp.id,
        peekFee,
        fullFee,
        durationMinutes,
      },
    });
    setConfigApp(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.done}>Done</Text>
        </TouchableOpacity>
      </View>
      {/* Categories */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(i) => i}
        contentContainerStyle={styles.cats}
        renderItem={({ item }) => {
          const active = selectedCategory === item;
          return (
            <TouchableOpacity
              style={[styles.catChip, active && styles.catChipActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.catText, active && styles.catTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* App List */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const locked = isLocked(item.id);
          return (
            <View style={[styles.row, NEU_RAISED]}>
              <AppIcon app={item} size={40} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowCat}>{item.category}</Text>
              </View>
              {locked ? (
                <SlideToLock locked={true} />
              ) : (
                <SlideToLock onLock={() => handleSwipeComplete(item)} locked={false} />
              )}
            </View>
          );
        }}
      />

      {/* Lock Config Modal */}
      <LockConfigModal
        visible={!!configApp}
        appName={configApp?.name || ""}
        onClose={() => setConfigApp(null)}
        onConfirm={handleConfigConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  back: { ...T.body, color: C.textSecondary, fontWeight: "500" },
  done: { ...T.body, color: C.pink, fontWeight: "600" },

  // Categories
  cats: { paddingHorizontal: 20, marginBottom: 18, paddingVertical: 4 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: C.white,
    marginRight: 6,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  catChipActive: { backgroundColor: C.pink },
  catText: { fontSize: 10, fontWeight: "700", color: C.textSecondary, letterSpacing: 0.5, textTransform: "uppercase", lineHeight: 14, includeFontPadding: false },
  catTextActive: { color: C.textOnPink },

  // List
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  rowInfo: { flex: 1, marginLeft: 12 },
  rowName: { ...T.bodyBold, fontSize: 15 },
  rowCat: { ...T.caption, marginTop: 2 },
});
