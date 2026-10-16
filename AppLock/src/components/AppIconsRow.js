import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

let NativeAppIconsRow = null;
if (Platform.OS === "ios") {
  try {
    const { UIManager } = require("react-native");
    if (UIManager.getViewManagerConfig && UIManager.getViewManagerConfig("AppIconsRowView")) {
      NativeAppIconsRow = require("react-native").requireNativeComponent("AppIconsRowView");
    }
  } catch (e) {}
}

export default function AppIconsRow({ listId = "default", maxIcons = 3, appCount = 0 }) {
  if (NativeAppIconsRow && appCount > 0) {
    const iconsToShow = Math.min(appCount, maxIcons);
    const width = iconsToShow * 28 + (appCount > maxIcons ? 28 : 0) + 16;
    return (
      <View style={{ width, height: 40 }}>
        <NativeAppIconsRow
          listId={listId}
          maxIcons={maxIcons}
          style={{ flex: 1 }}
        />
      </View>
    );
  }

  // Fallback: pink placeholder squares
  if (appCount === 0) return null;

  return (
    <View style={styles.row}>
      {Array.from({ length: Math.min(appCount, maxIcons) }).map((_, i) => (
        <View key={i} style={[styles.icon, { marginLeft: i > 0 ? -8 : 0, zIndex: maxIcons - i }]}>
          <View style={[styles.iconInner, { opacity: 1 - i * 0.15 }]} />
        </View>
      ))}
      {appCount > maxIcons && (
        <View style={[styles.icon, styles.iconMore, { marginLeft: -8 }]}>
          <Text style={styles.moreText}>+{appCount - maxIcons}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  icon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.9)",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  iconInner: { width: 28, height: 28, borderRadius: 7, backgroundColor: "rgba(0,0,0,0.04)" },
  iconMore: { backgroundColor: "rgba(255,255,255,0.85)" },
  moreText: { fontSize: 12, fontWeight: "800", color: "#2D2D2D" },
});
