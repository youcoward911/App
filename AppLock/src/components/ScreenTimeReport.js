import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { requireNativeComponent } from "react-native";

let NativeReportView = null;
try {
  if (Platform.OS === "ios") {
    NativeReportView = requireNativeComponent("DeviceActivityReportView");
  }
} catch (e) {
  // Extension not available in this build
}

export default function ScreenTimeReport({ style }) {
  if (!NativeReportView) {
    return null; // Hide until extension is built
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionLabel}>SCREEN TIME</Text>
      <View style={styles.reportWrap}>
        <NativeReportView style={styles.report} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2D2D2D",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  reportWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    // The report is drawn by the extension and can't tell us its height, so the box is
    // sized for its full content: the total plus the top 5 apps (targets/report/AppUsageView)
    height: 380,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#C9A0B0",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  report: {
    flex: 1,
  },
  fallback: {
    padding: 20,
    alignItems: "center",
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2D2D2D",
  },
});

// The single most-used app over the last 7 days (icon, name, total time), drawn by the
// report extension's "TopAppWeek" scene. Renders nothing in builds without the extension.
export function TopAppWeek({ style }) {
  if (!NativeReportView) return null;
  return (
    <View style={[{ height: 76 }, style]}>
      <NativeReportView reportContext="TopAppWeek" style={{ flex: 1 }} />
    </View>
  );
}
