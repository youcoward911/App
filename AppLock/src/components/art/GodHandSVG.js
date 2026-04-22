import React from "react";
import { View, StyleSheet } from "react-native";

// Massive godlike hand descending — pure RN Views
export default function GodHandSVG({ size = 120 }) {
  const s = size / 120;
  return (
    <View style={[styles.wrap, { width: 120 * s, height: 150 * s }]}>
      {/* Dark sleeve */}
      <View style={[styles.sleeve, {
        width: 60 * s, height: 50 * s,
        borderBottomLeftRadius: 8 * s, borderBottomRightRadius: 8 * s,
        top: 0, left: 30 * s,
      }]} />

      {/* Cuff */}
      <View style={[styles.cuff, {
        width: 68 * s, height: 10 * s, borderRadius: 5 * s,
        top: 44 * s, left: 26 * s,
      }]} />

      {/* Palm */}
      <View style={[styles.palm, {
        width: 70 * s, height: 56 * s,
        borderRadius: 14 * s,
        top: 50 * s, left: 25 * s,
      }]}>
        {/* Knuckle lines */}
        <View style={[styles.knuckle, { top: 10 * s, left: 10 * s, width: 16 * s }]} />
        <View style={[styles.knuckle, { top: 9 * s, left: 28 * s, width: 16 * s }]} />
        <View style={[styles.knuckle, { top: 10 * s, left: 46 * s, width: 14 * s }]} />
      </View>

      {/* Thumb */}
      <View style={[styles.finger, {
        width: 18 * s, height: 36 * s, borderRadius: 9 * s,
        top: 56 * s, left: 10 * s,
        transform: [{ rotate: "15deg" }],
      }]}>
        <View style={[styles.nail, { width: 12 * s, height: 8 * s, borderRadius: 4 * s, bottom: 2 * s }]} />
      </View>

      {/* Index finger */}
      <View style={[styles.finger, {
        width: 16 * s, height: 42 * s, borderRadius: 8 * s,
        top: 98 * s, left: 26 * s,
      }]}>
        <View style={[styles.nail, { width: 11 * s, height: 7 * s, borderRadius: 4 * s, bottom: 2 * s }]} />
      </View>

      {/* Middle finger */}
      <View style={[styles.finger, {
        width: 16 * s, height: 46 * s, borderRadius: 8 * s,
        top: 100 * s, left: 42 * s,
      }]}>
        <View style={[styles.nail, { width: 11 * s, height: 7 * s, borderRadius: 4 * s, bottom: 2 * s }]} />
      </View>

      {/* Ring finger */}
      <View style={[styles.finger, {
        width: 16 * s, height: 44 * s, borderRadius: 8 * s,
        top: 98 * s, left: 58 * s,
      }]}>
        <View style={[styles.nail, { width: 11 * s, height: 7 * s, borderRadius: 4 * s, bottom: 2 * s }]} />
      </View>

      {/* Pinky */}
      <View style={[styles.finger, {
        width: 14 * s, height: 36 * s, borderRadius: 7 * s,
        top: 94 * s, left: 74 * s,
      }]}>
        <View style={[styles.nail, { width: 10 * s, height: 6 * s, borderRadius: 3 * s, bottom: 2 * s }]} />
      </View>

      {/* Slop dripping from fingers */}
      <View style={[styles.drip, {
        width: 4 * s, height: 14 * s, borderRadius: 2 * s,
        top: 138 * s, left: 32 * s,
      }]} />
      <View style={[styles.drip, {
        width: 3 * s, height: 10 * s, borderRadius: 1.5 * s,
        top: 142 * s, left: 49 * s,
      }]} />
      <View style={[styles.drip, {
        width: 4 * s, height: 12 * s, borderRadius: 2 * s,
        top: 140 * s, left: 65 * s,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  sleeve: { position: "absolute", backgroundColor: "#1A1A1A" },
  cuff: { position: "absolute", backgroundColor: "#3A3A3A" },
  palm: {
    position: "absolute", backgroundColor: "#F5C8A8",
    borderWidth: 1, borderColor: "#E8B090",
  },
  knuckle: {
    position: "absolute", height: 1,
    backgroundColor: "#D8A888",
  },
  finger: {
    position: "absolute", backgroundColor: "#F5C8A8",
    borderWidth: 0.5, borderColor: "#E0B098",
    alignItems: "center",
  },
  nail: {
    position: "absolute", backgroundColor: "#FFE8E8",
    borderWidth: 0.5, borderColor: "#F0C8C8",
  },
  drip: { position: "absolute", backgroundColor: "#8CA040", opacity: 0.8 },
});
