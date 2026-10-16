import React from "react";
import { View, Text, StyleSheet, Platform, requireNativeComponent } from "react-native";
import { C } from "../utils/theme";

let NativeSelectedApps = null;
try {
  if (Platform.OS === "ios") {
    NativeSelectedApps = requireNativeComponent("SelectedAppsView");
  }
} catch (e) {}

export default function SelectedAppsList({ listId = "default", appCount = 0 }) {
  if (NativeSelectedApps && appCount > 0) {
    // Estimate height: ~72px per app row
    const estimatedHeight = Math.max(appCount * 72, 100);
    return (
      <View style={[styles.container, { height: estimatedHeight }]}>
        <NativeSelectedApps
          listId={listId}
          style={{ flex: 1 }}
        />
      </View>
    );
  }

  // Fallback for Expo Go or no apps
  if (appCount === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No apps selected yet</Text>
        <Text style={styles.emptyHint}>Tap Add / Remove to pick apps</Text>
      </View>
    );
  }

  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackCount}>{appCount} app{appCount !== 1 ? "s" : ""} selected</Text>
      <Text style={styles.fallbackHint}>App details visible in full build</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  empty: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textSecondary,
  },
  emptyHint: {
    fontSize: 12,
    fontWeight: "500",
    color: C.textTertiary,
    marginTop: 4,
  },
  fallback: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
  },
  fallbackCount: {
    fontSize: 16,
    fontWeight: "800",
    color: C.text,
  },
  fallbackHint: {
    fontSize: 12,
    fontWeight: "500",
    color: C.textTertiary,
    marginTop: 4,
  },
});
