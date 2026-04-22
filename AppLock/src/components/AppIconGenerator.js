import React from "react";
import { View, StyleSheet } from "react-native";

// Static pig face for app icon rendering
// This can be screenshotted and used as the app icon asset
// Render at 1024x1024 equivalent for best quality

export default function AppIconGenerator({ size = 200 }) {
  const s = size / 200;

  return (
    <View style={[styles.bg, { width: size, height: size, borderRadius: size * 0.22 }]}>
      {/* Ears */}
      <View style={[styles.ear, styles.earLeft, {
        width: 44 * s, height: 52 * s, borderRadius: 16 * s,
        top: 20 * s, left: 28 * s, backgroundColor: "#E8899A",
      }]} />
      <View style={[styles.ear, styles.earRight, {
        width: 44 * s, height: 52 * s, borderRadius: 16 * s,
        top: 20 * s, right: 28 * s, backgroundColor: "#E8899A",
      }]} />

      {/* Face */}
      <View style={[styles.face, {
        width: 128 * s, height: 120 * s, borderRadius: 60 * s,
        top: 50 * s, backgroundColor: "#FFB6C1",
      }]}>
        {/* Eyes */}
        <View style={[styles.eye, { width: 16 * s, height: 16 * s, borderRadius: 8 * s, top: 32 * s, left: 28 * s }]} />
        <View style={[styles.eye, { width: 16 * s, height: 16 * s, borderRadius: 8 * s, top: 32 * s, right: 28 * s }]} />

        {/* Smile */}
        <View style={[styles.smile, {
          width: 28 * s, height: 12 * s,
          borderBottomLeftRadius: 14 * s, borderBottomRightRadius: 14 * s,
          bottom: 28 * s, borderWidth: 3 * s, borderTopWidth: 0,
          borderColor: "#B06070",
        }]} />

        {/* Snout */}
        <View style={[styles.snout, {
          width: 60 * s, height: 40 * s, borderRadius: 20 * s,
          bottom: 16 * s, backgroundColor: "#F09AAF",
        }]}>
          <View style={[styles.nostril, { width: 12 * s, height: 14 * s, borderRadius: 6 * s, left: 12 * s }]} />
          <View style={[styles.nostril, { width: 12 * s, height: 14 * s, borderRadius: 6 * s, right: 12 * s }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: "#FFF0F3",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  ear: { position: "absolute", zIndex: 0 },
  earLeft: { transform: [{ rotate: "-15deg" }] },
  earRight: { transform: [{ rotate: "15deg" }] },
  face: { position: "absolute", zIndex: 1, alignSelf: "center" },
  eye: { position: "absolute", backgroundColor: "#2C2C2E", zIndex: 2 },
  smile: { position: "absolute", alignSelf: "center", zIndex: 3, backgroundColor: "transparent" },
  snout: {
    position: "absolute", alignSelf: "center", zIndex: 2,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4,
  },
  nostril: { backgroundColor: "#D07888" },
});
