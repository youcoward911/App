import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { useAppLock } from "../context/AppLockContext";
import { POPULAR_APPS, CATEGORIES } from "../data/defaultApps";
import AppIcon from "../components/AppIcon";
import { C, T, CARD_SHADOW } from "../utils/theme";

export default function AddAppsScreen({ navigation }) {
  const { state, dispatch } = useAppLock();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [customFee, setCustomFee] = useState(
    state.settings.defaultFee.toString()
  );

  const filtered =
    selectedCategory === "All"
      ? POPULAR_APPS
      : POPULAR_APPS.filter((a) => a.category === selectedCategory);

  const isLocked = (id) => id in state.lockedApps;

  const LOCK_WARNINGS = [
    "Are you sure you can handle it?",
    "You sure about this?",
    "You sure? There's no going back now.",
    "Another app for your master to control. Ready?",
    "More slop to pay for. You sure, piggy?",
  ];

  const toggle = (id) => {
    if (isLocked(id)) {
      dispatch({ type: "REMOVE_APP", payload: { appId: id } });
    } else {
      const warning = LOCK_WARNINGS[Math.floor(Math.random() * LOCK_WARNINGS.length)];
      Alert.alert("Lock this app?", warning, [
        { text: "Nevermind", style: "cancel" },
        {
          text: "Lock it.",
          onPress: () => {
            const fee = parseInt(customFee, 10) || state.settings.defaultFee;
            dispatch({ type: "LOCK_APP", payload: { appId: id, unlockFee: fee } });
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lock More Slop</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.done}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Fee */}
      <View style={[styles.feeCard, CARD_SHADOW]}>
        <View>
          <Text style={styles.feeTitle}>Unlock fee</Text>
          <Text style={styles.feeCaption}>coins per act of obedience</Text>
        </View>
        <View style={styles.feeInput}>
          <View style={styles.feeCoinIcon}>
            <Text style={styles.feeCoinP}>P</Text>
          </View>
          <TextInput
            style={styles.feeValue}
            value={customFee}
            onChangeText={setCustomFee}
            keyboardType="number-pad"
            placeholder="5"
            placeholderTextColor={C.textTertiary}
          />
        </View>
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
            <TouchableOpacity
              style={[styles.row, CARD_SHADOW]}
              activeOpacity={0.8}
              onPress={() => toggle(item.id)}
            >
              <AppIcon app={item} size={40} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowCat}>{item.category}</Text>
              </View>
              <View style={[styles.badge, locked && styles.badgeActive]}>
                <Text style={[styles.badgeText, locked && styles.badgeTextActive]}>
                  {locked ? "Locked" : "Lock"}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
    paddingVertical: 14,
  },
  back: { ...T.body, color: C.textSecondary, fontWeight: "500" },
  headerTitle: { ...T.h2 },
  done: { ...T.body, color: C.pink, fontWeight: "600" },

  // Fee
  feeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  feeTitle: { ...T.bodyBold },
  feeCaption: { ...T.caption, marginTop: 2 },
  feeInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.pinkPale,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  feeCoinIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  feeCoinP: { color: "#FFF", fontSize: 10, fontWeight: "900" },
  feeValue: {
    fontSize: 20,
    fontWeight: "800",
    color: C.pink,
    minWidth: 50,
  },

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
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  rowInfo: { flex: 1, marginLeft: 12 },
  rowName: { ...T.bodyBold, fontSize: 15 },
  rowCat: { ...T.caption, marginTop: 2 },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.pinkPale,
  },
  badgeActive: { backgroundColor: C.pink },
  badgeText: { fontSize: 13, fontWeight: "600", color: C.pink },
  badgeTextActive: { color: C.textOnPink },
});
