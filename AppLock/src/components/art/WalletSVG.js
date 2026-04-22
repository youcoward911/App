import React from "react";
import { View, StyleSheet } from "react-native";

// Leather wallet with gold clasp — pure RN Views
export default function WalletSVG({ size = 80 }) {
  const s = size / 80;
  return (
    <View style={[styles.wrap, { width: 80 * s, height: 72 * s }]}>
      {/* Inner lining */}
      <View style={[styles.lining, {
        width: 56 * s, height: 24 * s, borderRadius: 6 * s,
        top: 6 * s, left: 12 * s,
      }]} />

      {/* Main body */}
      <View style={[styles.body, {
        width: 64 * s, height: 44 * s, borderRadius: 10 * s,
        top: 20 * s, left: 8 * s,
      }]}>
        {/* Stitching */}
        <View style={[styles.stitch, { top: 6 * s, left: 6 * s, right: 6 * s }]} />
        <View style={[styles.stitch, { bottom: 6 * s, left: 6 * s, right: 6 * s }]} />

        {/* Card pocket */}
        <View style={[styles.pocket, {
          width: 22 * s, height: 14 * s, borderRadius: 3 * s,
          top: 12 * s, left: 6 * s,
        }]} />
      </View>

      {/* Flap (open) */}
      <View style={[styles.flap, {
        width: 52 * s, height: 16 * s,
        borderTopLeftRadius: 12 * s, borderTopRightRadius: 12 * s,
        top: 6 * s, left: 14 * s,
      }]} />

      {/* Gold clasp */}
      <View style={[styles.clasp, {
        width: 12 * s, height: 12 * s, borderRadius: 6 * s,
        top: 14 * s, left: 34 * s,
      }]}>
        <View style={[styles.claspInner, {
          width: 7 * s, height: 7 * s, borderRadius: 3.5 * s,
        }]} />
      </View>

      {/* Bills peeking out */}
      <View style={[styles.bill, {
        width: 18 * s, height: 8 * s, borderRadius: 2 * s,
        top: 10 * s, left: 18 * s,
      }]} />
      <View style={[styles.bill2, {
        width: 14 * s, height: 6 * s, borderRadius: 2 * s,
        top: 12 * s, left: 44 * s,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  lining: { position: "absolute", backgroundColor: "#D4A574" },
  body: {
    position: "absolute", backgroundColor: "#7B4E2C",
    borderWidth: 1, borderColor: "#6B3F1F",
  },
  stitch: {
    position: "absolute", height: 1,
    borderTopWidth: 1, borderColor: "#A0774C", borderStyle: "dashed",
  },
  pocket: { position: "absolute", backgroundColor: "#5A3318", opacity: 0.5 },
  flap: { position: "absolute", backgroundColor: "#9B6E4C" },
  clasp: {
    position: "absolute", backgroundColor: "#FFD700",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#CC8800",
  },
  claspInner: { backgroundColor: "#FFE44D" },
  bill: { position: "absolute", backgroundColor: "#85BB65", opacity: 0.7 },
  bill2: { position: "absolute", backgroundColor: "#6BA352", opacity: 0.6 },
});
