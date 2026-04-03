import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppLock } from "../context/AppLockContext";
import { POPULAR_APPS } from "../data/defaultApps";
import { COLORS, FONTS, SHADOW, SHADOW_PINK, GRADIENTS } from "../utils/theme";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const { state } = useAppLock();
  const lockedAppIds = Object.keys(state.lockedApps);
  const lockedApps = POPULAR_APPS.filter((app) =>
    lockedAppIds.includes(app.id)
  );

  const getAppStatus = (appId) => {
    const app = state.lockedApps[appId];
    if (!app) return null;
    if (!app.lockedAt) return "unlocked";
    return "locked";
  };

  const getTimeSinceLock = (appId) => {
    const app = state.lockedApps[appId];
    if (!app?.lockedAt) return "";
    const mins = Math.floor((Date.now() - app.lockedAt) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ${mins % 60}m`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.pigEmoji}>🐷</Text>
          <View>
            <Text style={styles.title}>PayPig</Text>
            <Text style={styles.subtitle}>Pay for your weakness</Text>
          </View>
        </View>
      </View>

      {/* Stats Strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statPill}>
          <LinearGradient
            colors={[COLORS.pinkSoft, "transparent"]}
            style={styles.statPillBg}
          />
          <Text style={styles.statValue}>{lockedApps.length}</Text>
          <Text style={styles.statLabel}>LOCKED</Text>
        </View>
        <View style={styles.statPill}>
          <LinearGradient
            colors={[COLORS.purpleSoft, "transparent"]}
            style={styles.statPillBg}
          />
          <Text style={styles.statValue}>{state.totalUnlocks}</Text>
          <Text style={styles.statLabel}>CAVED</Text>
        </View>
        <View style={styles.statPill}>
          <LinearGradient
            colors={[COLORS.goldSoft, "transparent"]}
            style={styles.statPillBg}
          />
          <Text style={[styles.statValue, { color: COLORS.gold }]}>
            ${state.totalSpent.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>WASTED</Text>
        </View>
      </View>

      {lockedApps.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>🐽</Text>
          </View>
          <Text style={styles.emptyTitle}>No apps locked yet</Text>
          <Text style={styles.emptyText}>
            Go ahead, pretend you don't need this.{"\n"}We both know you'll be
            back.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("AddApps")}
          >
            <LinearGradient
              colors={GRADIENTS.pink}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addButtonGradient}
            >
              <Text style={styles.addButtonText}>Lock Some Apps</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lockedApps}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const status = getAppStatus(item.id);
            const lockInfo = state.lockedApps[item.id];
            const isLocked = status === "locked";
            return (
              <TouchableOpacity
                style={[styles.appCard, !isLocked && styles.appCardUnlocked]}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("Unlock", { appId: item.id })
                }
              >
                {/* Accent bar */}
                <View
                  style={[
                    styles.accentBar,
                    { backgroundColor: isLocked ? COLORS.pink : COLORS.mint },
                  ]}
                />
                <View style={styles.appIconContainer}>
                  <Text style={styles.appIcon}>{item.icon}</Text>
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{item.name}</Text>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: isLocked
                            ? COLORS.pink
                            : COLORS.mint,
                        },
                      ]}
                    />
                    <Text style={styles.appStatus}>
                      {isLocked
                        ? `Locked ${getTimeSinceLock(item.id)}`
                        : "Unlocked"}
                    </Text>
                  </View>
                </View>
                <View style={styles.feeContainer}>
                  <Text style={styles.feeValue}>
                    ${lockInfo?.unlockFee?.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addMoreButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("AddApps")}
            >
              <Text style={styles.addMorePlus}>+</Text>
              <Text style={styles.addMoreText}>Lock More Apps</Text>
            </TouchableOpacity>
          }
        />
      )}
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pigEmoji: {
    fontSize: 38,
    marginRight: 14,
  },
  title: {
    ...FONTS.heroTitle,
  },
  subtitle: {
    ...FONTS.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsStrip: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 10,
  },
  statPill: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statPillBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    ...FONTS.label,
    fontSize: 9,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 20,
  },
  appCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    ...SHADOW,
  },
  appCardUnlocked: {
    opacity: 0.55,
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  appIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  appIcon: {
    fontSize: 24,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  appStatus: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textMuted,
  },
  feeContainer: {
    backgroundColor: COLORS.goldSoft,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  feeValue: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.gold,
    letterSpacing: -0.3,
  },
  chevron: {
    fontSize: 22,
    fontWeight: "300",
    color: COLORS.textDim,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.pinkSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    ...FONTS.title,
    fontSize: 22,
    marginBottom: 10,
  },
  emptyText: {
    ...FONTS.body,
    textAlign: "center",
    color: COLORS.textMuted,
  },
  addButton: {
    marginTop: 28,
    borderRadius: 16,
    overflow: "hidden",
    ...SHADOW_PINK,
  },
  addButtonGradient: {
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 16,
  },
  addButtonText: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderStyle: "dashed",
    borderRadius: 18,
    padding: 18,
    marginTop: 2,
    marginBottom: 10,
  },
  addMorePlus: {
    fontSize: 20,
    fontWeight: "300",
    color: COLORS.textMuted,
    marginRight: 8,
  },
  addMoreText: {
    color: COLORS.textMuted,
    fontWeight: "600",
    fontSize: 14,
  },
});
