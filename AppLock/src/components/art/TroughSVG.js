import React from "react";
import { View, StyleSheet } from "react-native";

// Wooden feeding trough — pure RN Views
export default function TroughSVG({ size = 160, showSlop = false }) {
  const s = size / 160;
  return (
    <View style={[styles.wrap, { width: 160 * s, height: 88 * s }]}>
      {/* Shadow */}
      <View style={[styles.shadow, {
        width: 130 * s, height: 8 * s, borderRadius: 4 * s,
        bottom: 0, left: 15 * s,
      }]} />

      {/* Legs */}
      <View style={[styles.leg, { left: 22 * s, bottom: 2 * s, width: 10 * s, height: 10 * s, borderRadius: 2 * s }]} />
      <View style={[styles.leg, { right: 22 * s, bottom: 2 * s, width: 10 * s, height: 10 * s, borderRadius: 2 * s }]} />

      {/* Trough body — wider at top */}
      <View style={[styles.body, {
        width: 140 * s, height: 54 * s, borderRadius: 6 * s,
        top: 22 * s, left: 10 * s,
      }]}>
        {/* Wood grain lines */}
        <View style={[styles.grain, { left: 20 * s, top: 5 * s, height: 40 * s }]} />
        <View style={[styles.grain, { left: 45 * s, top: 5 * s, height: 40 * s }]} />
        <View style={[styles.grain, { left: 70 * s, top: 5 * s, height: 40 * s }]} />
        <View style={[styles.grain, { left: 95 * s, top: 5 * s, height: 40 * s }]} />
        <View style={[styles.grain, { left: 120 * s, top: 5 * s, height: 40 * s }]} />

        {/* Metal bands */}
        <View style={[styles.band, { top: 14 * s }]} />
        <View style={[styles.band, { top: 34 * s }]} />

        {/* Rivets */}
        <View style={[styles.rivet, { top: 12 * s, left: 10 * s }]} />
        <View style={[styles.rivet, { top: 12 * s, right: 10 * s }]} />
        <View style={[styles.rivet, { top: 32 * s, left: 8 * s }]} />
        <View style={[styles.rivet, { top: 32 * s, right: 8 * s }]} />

        {/* Slop inside */}
        {showSlop && (
          <View style={[styles.slopContainer, {
            top: 6 * s, left: 8 * s, right: 8 * s, bottom: 6 * s,
            borderRadius: 4 * s,
          }]}>
            {/* Slop surface */}
            <View style={[styles.slopSurface, { height: 10 * s, borderRadius: 4 * s }]} />
            {/* Chunky bits */}
            <View style={[styles.chunk, { top: 14 * s, left: 12 * s, width: 12 * s, height: 8 * s }]} />
            <View style={[styles.chunk2, { top: 10 * s, left: 50 * s, width: 10 * s, height: 6 * s }]} />
            <View style={[styles.chunk, { top: 20 * s, left: 30 * s, width: 14 * s, height: 8 * s }]} />
            <View style={[styles.chunk2, { top: 16 * s, left: 75 * s, width: 8 * s, height: 6 * s }]} />
            {/* Bubbles */}
            <View style={[styles.bubble, { top: 6 * s, left: 25 * s, width: 6 * s, height: 5 * s }]} />
            <View style={[styles.bubble, { top: 8 * s, left: 60 * s, width: 4 * s, height: 3 * s }]} />
          </View>
        )}
      </View>

      {/* Rim — thick top edge */}
      <View style={[styles.rim, {
        width: 148 * s, height: 14 * s,
        borderTopLeftRadius: 8 * s, borderTopRightRadius: 8 * s,
        borderBottomLeftRadius: 4 * s, borderBottomRightRadius: 4 * s,
        top: 12 * s, left: 6 * s,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  shadow: { position: "absolute", backgroundColor: "#000", opacity: 0.1 },
  leg: { position: "absolute", backgroundColor: "#6B3F1F" },
  body: {
    position: "absolute", backgroundColor: "#A06830",
    overflow: "hidden",
    borderWidth: 1, borderColor: "#8B5E3C",
  },
  grain: {
    position: "absolute", width: 1, backgroundColor: "#8B5E3C", opacity: 0.3,
  },
  band: {
    position: "absolute", left: 0, right: 0, height: 3,
    backgroundColor: "#999", opacity: 0.4,
  },
  rivet: {
    position: "absolute", width: 6, height: 6, borderRadius: 3,
    backgroundColor: "#AAA", opacity: 0.5,
  },
  rim: {
    position: "absolute", backgroundColor: "#C8904E",
    borderWidth: 1, borderColor: "#9B6E3C",
  },
  slopContainer: {
    position: "absolute", backgroundColor: "#6B8830", overflow: "hidden",
  },
  slopSurface: {
    backgroundColor: "#A8B860", opacity: 0.7,
  },
  chunk: {
    position: "absolute", borderRadius: 4,
    backgroundColor: "#7A9835", opacity: 0.7,
  },
  chunk2: {
    position: "absolute", borderRadius: 3,
    backgroundColor: "#8CA040", opacity: 0.6,
  },
  bubble: {
    position: "absolute", borderRadius: 10,
    backgroundColor: "#B8D060", opacity: 0.5,
  },
});
