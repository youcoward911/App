import React from "react";
import { View, StyleSheet } from "react-native";

// Slop splash burst — pure RN Views
export default function SlopSplashSVG({ size = 100 }) {
  const s = size / 100;
  return (
    <View style={[styles.wrap, { width: 100 * s, height: 60 * s }]}>
      {/* Center impact */}
      <View style={[styles.impact, {
        width: 40 * s, height: 14 * s, borderRadius: 7 * s,
        bottom: 8 * s, left: 30 * s,
      }]} />

      {/* Left splashes */}
      <View style={[styles.dropL, {
        width: 10 * s, height: 8 * s, borderRadius: 5 * s,
        top: 20 * s, left: 8 * s,
      }]} />
      <View style={[styles.dropL2, {
        width: 8 * s, height: 7 * s, borderRadius: 4 * s,
        top: 10 * s, left: 18 * s,
      }]} />
      <View style={[styles.dropL, {
        width: 7 * s, height: 5 * s, borderRadius: 3 * s,
        top: 30 * s, left: 4 * s,
      }]} />

      {/* Right splashes */}
      <View style={[styles.dropR, {
        width: 10 * s, height: 8 * s, borderRadius: 5 * s,
        top: 20 * s, right: 8 * s,
      }]} />
      <View style={[styles.dropR2, {
        width: 8 * s, height: 7 * s, borderRadius: 4 * s,
        top: 10 * s, right: 18 * s,
      }]} />
      <View style={[styles.dropR, {
        width: 7 * s, height: 5 * s, borderRadius: 3 * s,
        top: 30 * s, right: 4 * s,
      }]} />

      {/* Top splashes */}
      <View style={[styles.dropTop, {
        width: 7 * s, height: 7 * s, borderRadius: 3.5 * s,
        top: 2 * s, left: 40 * s,
      }]} />
      <View style={[styles.dropTop2, {
        width: 6 * s, height: 6 * s, borderRadius: 3 * s,
        top: 0, left: 56 * s,
      }]} />
      <View style={[styles.dropTop, {
        width: 5 * s, height: 5 * s, borderRadius: 2.5 * s,
        top: 6 * s, left: 48 * s,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  impact: { position: "absolute", backgroundColor: "#8CA040", opacity: 0.5 },
  dropL: { position: "absolute", backgroundColor: "#8CA040", opacity: 0.8 },
  dropL2: { position: "absolute", backgroundColor: "#A0B848", opacity: 0.7 },
  dropR: { position: "absolute", backgroundColor: "#8CA040", opacity: 0.8 },
  dropR2: { position: "absolute", backgroundColor: "#A0B848", opacity: 0.7 },
  dropTop: { position: "absolute", backgroundColor: "#B8D060", opacity: 0.6 },
  dropTop2: { position: "absolute", backgroundColor: "#A0B848", opacity: 0.5 },
});
