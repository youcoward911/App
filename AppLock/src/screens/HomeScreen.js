import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useAppLock } from "../context/AppLockContext";
import { POPULAR_APPS } from "../data/defaultApps";
import { COLORS, FONTS } from "../utils/theme";

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
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔒 AppLock</Text>
        <Text style={styles.subtitle}>Your self-control assistant (LOL)</Text>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lockedApps.length}</Text>
          <Text style={styles.statLabel}>Locked</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{state.totalUnlocks}</Text>
          <Text style={styles.statLabel}>Failures</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>
            ${state.totalSpent.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Wasted</Text>
        </View>
      </View>

      {lockedApps.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤳</Text>
          <Text style={styles.emptyTitle}>No apps locked yet</Text>
          <Text style={styles.emptyText}>
            Go ahead, pretend you don't need this.{"\n"}We both know you'll be
            back.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddApps")}
          >
            <Text style={styles.addButtonText}>Lock Some Apps</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lockedApps}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const status = getAppStatus(item.id);
            const lockInfo = state.lockedApps[item.id];
            return (
              <TouchableOpacity
                style={[
                  styles.appCard,
                  status === "unlocked" && styles.appCardUnlocked,
                ]}
                onPress={() =>
                  navigation.navigate("Unlock", { appId: item.id })
                }
              >
                <Text style={styles.appIcon}>{item.icon}</Text>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{item.name}</Text>
                  <Text style={styles.appStatus}>
                    {status === "locked"
                      ? `🔒 Locked ${getTimeSinceLock(item.id)}`
                      : "🔓 Temporarily unlocked"}
                  </Text>
                </View>
                <View style={styles.feeContainer}>
                  <Text style={styles.feeLabel}>Fee</Text>
                  <Text style={styles.feeValue}>
                    ${lockInfo?.unlockFee?.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => navigation.navigate("AddApps")}
            >
              <Text style={styles.addMoreText}>+ Lock More Apps</Text>
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    ...FONTS.title,
    fontSize: 32,
  },
  subtitle: {
    ...FONTS.body,
    marginTop: 4,
  },
  statsBar: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
  },
  statLabel: {
    ...FONTS.body,
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  list: {
    paddingHorizontal: 20,
  },
  appCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  appCardUnlocked: {
    borderLeftColor: COLORS.success,
    opacity: 0.7,
  },
  appIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    ...FONTS.subtitle,
    fontSize: 16,
  },
  appStatus: {
    ...FONTS.body,
    fontSize: 12,
    marginTop: 2,
  },
  feeContainer: {
    alignItems: "center",
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  feeValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.warning,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    ...FONTS.subtitle,
    fontSize: 22,
    marginBottom: 8,
  },
  emptyText: {
    ...FONTS.body,
    textAlign: "center",
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 24,
  },
  addButtonText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 16,
  },
  addMoreButton: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  addMoreText: {
    color: COLORS.textMuted,
    fontWeight: "600",
    fontSize: 15,
  },
});
