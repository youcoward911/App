import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppLock } from "../context/AppLockContext";
import { POPULAR_APPS, CATEGORIES } from "../data/defaultApps";
import { COLORS, FONTS, SHADOW, GRADIENTS } from "../utils/theme";

export default function AddAppsScreen({ navigation }) {
  const { state, dispatch } = useAppLock();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [customFee, setCustomFee] = useState(
    state.settings.defaultFee.toString()
  );

  const filteredApps =
    selectedCategory === "All"
      ? POPULAR_APPS
      : POPULAR_APPS.filter((app) => app.category === selectedCategory);

  const isLocked = (appId) => appId in state.lockedApps;

  const toggleApp = (appId) => {
    if (isLocked(appId)) {
      dispatch({ type: "REMOVE_APP", payload: { appId } });
    } else {
      const fee = parseFloat(customFee) || state.settings.defaultFee;
      dispatch({ type: "LOCK_APP", payload: { appId, unlockFee: fee } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerPill}>
            <Text style={styles.headerPillText}>
              {Object.keys(state.lockedApps).length} locked
            </Text>
          </View>
        </View>
        <Text style={styles.title}>Your Addictions</Text>
        <Text style={styles.subtitle}>
          Pick the apps that own you. Don't worry,{"\n"}
          we already know you can't stop.
        </Text>
      </View>

      {/* Fee Setting */}
      <View style={styles.feeSection}>
        <View style={styles.feeRow}>
          <View style={styles.feeLabelRow}>
            <Text style={styles.feeLabel}>Your price tag</Text>
            <Text style={styles.feeHint}>per act of obedience</Text>
          </View>
          <View style={styles.feeInputContainer}>
            <Text style={styles.feeCurrency}>$</Text>
            <TextInput
              style={styles.feeInput}
              value={customFee}
              onChangeText={setCustomFee}
              keyboardType="decimal-pad"
              placeholder="0.50"
              placeholderTextColor={COLORS.textDim}
            />
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categories}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(item)}
            >
              {selectedCategory === item ? (
                <LinearGradient
                  colors={GRADIENTS.pink}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.categoryChipGradient}
                >
                  <Text style={[styles.categoryText, styles.categoryTextActive]}>
                    {item}
                  </Text>
                </LinearGradient>
              ) : (
                <Text style={styles.categoryText}>{item}</Text>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* App List */}
      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const locked = isLocked(item.id);
          return (
            <TouchableOpacity
              style={[styles.appRow, locked && styles.appRowLocked]}
              activeOpacity={0.7}
              onPress={() => toggleApp(item.id)}
            >
              <View
                style={[
                  styles.appIconContainer,
                  locked && styles.appIconContainerLocked,
                ]}
              >
                <Text style={styles.appIcon}>{item.icon}</Text>
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{item.name}</Text>
                <Text style={styles.appCategory}>{item.category}</Text>
              </View>
              {locked ? (
                <View style={styles.lockToggleActive}>
                  <Text style={styles.lockToggleTextActive}>Locked</Text>
                </View>
              ) : (
                <View style={styles.lockToggle}>
                  <Text style={styles.lockToggleText}>Lock</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backArrow: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "300",
    marginTop: -2,
  },
  headerPill: {
    backgroundColor: COLORS.pinkSoft,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  headerPillText: {
    color: COLORS.pink,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    ...FONTS.title,
    marginBottom: 6,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  feeSection: {
    marginHorizontal: 24,
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feeLabelRow: {
    flex: 1,
  },
  feeLabel: {
    ...FONTS.subtitle,
    fontSize: 15,
  },
  feeHint: {
    ...FONTS.caption,
    fontSize: 11,
    marginTop: 2,
  },
  feeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgInput,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 110,
  },
  feeCurrency: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.gold,
    marginRight: 2,
  },
  feeInput: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.gold,
    minWidth: 60,
  },
  categories: {
    marginBottom: 12,
  },
  categoryChip: {
    marginRight: 8,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    borderColor: COLORS.pink,
    backgroundColor: "transparent",
  },
  categoryChipGradient: {
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  categoryText: {
    color: COLORS.textMuted,
    fontWeight: "600",
    fontSize: 13,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  categoryTextActive: {
    color: COLORS.text,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  appRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appRowLocked: {
    borderColor: COLORS.borderPink,
    backgroundColor: "rgba(255, 45, 120, 0.04)",
  },
  appIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: COLORS.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  appIconContainerLocked: {
    backgroundColor: COLORS.pinkSoft,
  },
  appIcon: {
    fontSize: 22,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 15,
  },
  appCategory: {
    ...FONTS.caption,
    marginTop: 2,
  },
  lockToggle: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  lockToggleText: {
    color: COLORS.textSecondary,
    fontWeight: "700",
    fontSize: 13,
  },
  lockToggleActive: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    backgroundColor: COLORS.pinkSoft,
    borderWidth: 1,
    borderColor: COLORS.borderPink,
  },
  lockToggleTextActive: {
    color: COLORS.pink,
    fontWeight: "700",
    fontSize: 13,
  },
});
