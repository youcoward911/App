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
import { useAppLock } from "../context/AppLockContext";
import { POPULAR_APPS, CATEGORIES } from "../data/defaultApps";
import { COLORS, FONTS } from "../utils/theme";

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Poison</Text>
        <Text style={styles.subtitle}>
          Pick the apps you can't stop using. No judgment. (Okay, lots of
          judgment.)
        </Text>
      </View>

      {/* Fee Setting */}
      <View style={styles.feeSection}>
        <Text style={styles.feeLabel}>Unlock fee for new apps:</Text>
        <View style={styles.feeInputContainer}>
          <Text style={styles.feeCurrency}>$</Text>
          <TextInput
            style={styles.feeInput}
            value={customFee}
            onChangeText={setCustomFee}
            keyboardType="decimal-pad"
            placeholder="0.50"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
        <Text style={styles.feeHint}>
          Make it hurt just enough to think twice 😈
        </Text>
      </View>

      {/* Category Filter */}
      <View style={styles.categories}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* App List */}
      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const locked = isLocked(item.id);
          return (
            <TouchableOpacity
              style={[styles.appRow, locked && styles.appRowLocked]}
              onPress={() => toggleApp(item.id)}
            >
              <Text style={styles.appIcon}>{item.icon}</Text>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{item.name}</Text>
                <Text style={styles.appCategory}>{item.category}</Text>
              </View>
              <View
                style={[
                  styles.lockToggle,
                  locked && styles.lockToggleActive,
                ]}
              >
                <Text style={styles.lockToggleText}>
                  {locked ? "🔒 Locked" : "Lock"}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  title: {
    ...FONTS.title,
  },
  subtitle: {
    ...FONTS.body,
    marginTop: 6,
    lineHeight: 20,
  },
  feeSection: {
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  feeLabel: {
    ...FONTS.body,
    fontSize: 14,
    marginBottom: 8,
  },
  feeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  feeCurrency: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.warning,
    marginRight: 4,
  },
  feeInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.warning,
    paddingVertical: 12,
  },
  feeHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  categories: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
    fontSize: 13,
  },
  categoryTextActive: {
    color: COLORS.text,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  appRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  appRowLocked: {
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  appIcon: {
    fontSize: 28,
    marginRight: 12,
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
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  lockToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lockToggleActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  lockToggleText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 13,
  },
});
