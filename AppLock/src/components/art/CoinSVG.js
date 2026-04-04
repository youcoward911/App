import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Piggy Coin — gold/pink gradient with P emblem
export default function CoinSVG({ size = 32 }) {
  const s = size / 32;
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {/* Shadow */}
      <View style={[styles.shadow, {
        width: size * 0.75, height: 6 * s, borderRadius: 3 * s,
        bottom: -2 * s, left: size * 0.125,
      }]} />

      {/* Coin edge (3D) */}
      <View style={[styles.edge, {
        width: size, height: size, borderRadius: size / 2,
        top: 1 * s,
      }]} />

      {/* Coin face */}
      <View style={[styles.face, {
        width: size, height: size, borderRadius: size / 2,
      }]}>
        {/* Inner ring */}
        <View style={[styles.ring, {
          width: size * 0.8, height: size * 0.8, borderRadius: size * 0.4,
        }]} />

        {/* P emblem */}
        <Text style={[styles.p, { fontSize: 16 * s }]}>P</Text>

        {/* Shine */}
        <View style={[styles.shine, {
          width: 12 * s, height: 10 * s, borderRadius: 6 * s,
          top: 4 * s, left: 4 * s,
        }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative", alignItems: "center" },
  shadow: { position: "absolute", backgroundColor: "#000", opacity: 0.1 },
  edge: { position: "absolute", backgroundColor: "#CC8800" },
  face: {
    position: "absolute",
    backgroundColor: "#FF69B4",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#FFD700",
  },
  ring: {
    position: "absolute",
    borderWidth: 1, borderColor: "#FFE44D", opacity: 0.5,
  },
  p: { color: "#FFF", fontWeight: "900", zIndex: 2 },
  shine: {
    position: "absolute", backgroundColor: "#FFF", opacity: 0.25,
    transform: [{ rotate: "-20deg" }],
  },
});
