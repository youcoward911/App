import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

// Animated pig mascot — the USER is the pig.
// Moods: "happy" (just fed/paid), "restless", "dirty", "feral"
// Happy = pink, clean, smiling. Fed and satisfied.
// Restless = slightly off-color, antsy.
// Dirty = brownish, mud splotches, angry brows.
// Feral = dark red/brown, shaking, furious, filthy.

export default function PigMascot({ size = 80, animate = true, mood = "happy" }) {
  const bob = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const tearOpacity = useRef(new Animated.Value(0)).current;
  const tearDrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;

    // Happy pig bobs gently. Feral pig shakes fast.
    const bobSpeed = mood === "feral" ? 300 : mood === "dirty" ? 600 : mood === "restless" ? 1000 : 1200;
    const bobHeight = mood === "feral" ? -2 : mood === "dirty" ? -3 : -6;

    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: bobHeight,
          duration: bobSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: bobSpeed,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const blinkRate = mood === "feral" ? 800 : mood === "dirty" ? 1500 : 3500;
    const blinkInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(blink, {
          toValue: 0.1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, blinkRate);

    // Occasional crying tears — fade in, drip down, fade out
    const tearInterval = mood === "feral" ? 4000 : mood === "dirty" ? 6000 : mood === "restless" ? 10000 : 8000;
    const tearTimer = setInterval(() => {
      tearDrop.setValue(0);
      Animated.parallel([
        Animated.timing(tearOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(tearDrop, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(tearOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      });
    }, tearInterval);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(tearTimer);
    };
  }, [animate, mood]);

  const s = size / 80;

  // HAPPY = clean pink. DIRTY = brownish. FERAL = dark red-brown, filthy.
  const faceColor =
    mood === "feral" ? "#B85555" :
    mood === "dirty" ? "#D4897A" :
    mood === "restless" ? "#F0A8A8" :
    "#FFB6C1";

  const earColor =
    mood === "feral" ? "#8B3535" :
    mood === "dirty" ? "#B0705F" :
    mood === "restless" ? "#D88A8A" :
    "#E8899A";

  const snoutColor =
    mood === "feral" ? "#A04545" :
    mood === "dirty" ? "#C07868" :
    mood === "restless" ? "#E09898" :
    "#F09AAF";

  // Angry squinted eyes for dirty/feral, happy wide eyes for fed
  const eyeHeight =
    mood === "feral" ? 3 * s :
    mood === "dirty" ? 4 * s :
    mood === "restless" ? 7 * s :
    8 * s;

  const eyeTop =
    mood === "feral" ? 19 * s :
    mood === "dirty" ? 18 * s :
    16 * s;

  const showAngryBrows = mood === "dirty" || mood === "feral";
  const showMudSplotches = mood === "dirty" || mood === "feral";
  const showSmile = mood === "happy";
  const showFrown = mood === "dirty" || mood === "feral";

  return (
    <Animated.View
      style={[
        styles.wrap,
        { width: size, height: size, transform: [{ translateY: bob }] },
      ]}
    >
      {/* Ears */}
      <View
        style={[
          styles.ear, styles.earLeft,
          { width: 22 * s, height: 26 * s, borderRadius: 8 * s, top: 2 * s, left: 6 * s, backgroundColor: earColor },
        ]}
      />
      <View
        style={[
          styles.ear, styles.earRight,
          { width: 22 * s, height: 26 * s, borderRadius: 8 * s, top: 2 * s, right: 6 * s, backgroundColor: earColor },
        ]}
      />

      {/* Face */}
      <View
        style={[
          styles.face,
          { width: 64 * s, height: 60 * s, borderRadius: 30 * s, top: 12 * s, backgroundColor: faceColor },
        ]}
      >
        {/* Mud splotches for dirty/feral */}
        {showMudSplotches && (
          <>
            <View style={[styles.mud, {
              width: 8 * s, height: 6 * s, borderRadius: 3 * s,
              top: 10 * s, left: 8 * s,
              backgroundColor: mood === "feral" ? "#6B3030" : "#A06050",
            }]} />
            <View style={[styles.mud, {
              width: 6 * s, height: 5 * s, borderRadius: 3 * s,
              top: 30 * s, right: 10 * s,
              backgroundColor: mood === "feral" ? "#6B3030" : "#A06050",
            }]} />
            <View style={[styles.mud, {
              width: 5 * s, height: 4 * s, borderRadius: 2 * s,
              bottom: 18 * s, left: 18 * s,
              backgroundColor: mood === "feral" ? "#5A2525" : "#906050",
            }]} />
          </>
        )}

        {/* Eyes */}
        <Animated.View
          style={[styles.eye, {
            width: 8 * s, height: eyeHeight, borderRadius: 4 * s,
            top: eyeTop, left: 14 * s, transform: [{ scaleY: blink }],
          }]}
        />
        <Animated.View
          style={[styles.eye, {
            width: 8 * s, height: eyeHeight, borderRadius: 4 * s,
            top: eyeTop, right: 14 * s, transform: [{ scaleY: blink }],
          }]}
        />

        {/* Tears — occasional crying */}
        <Animated.View
          style={[styles.tear, {
            width: 4 * s, height: 8 * s, borderRadius: 2 * s,
            top: (eyeTop + eyeHeight + 2 * s), left: 16 * s,
            opacity: tearOpacity,
            transform: [{ translateY: Animated.multiply(tearDrop, 12 * s) }],
          }]}
        />
        <Animated.View
          style={[styles.tear, {
            width: 4 * s, height: 8 * s, borderRadius: 2 * s,
            top: (eyeTop + eyeHeight + 2 * s), right: 16 * s,
            opacity: tearOpacity,
            transform: [{ translateY: Animated.multiply(tearDrop, 12 * s) }],
          }]}
        />

        {/* Angry brows — V-shaped for dirty/feral */}
        {showAngryBrows && (
          <>
            <View style={[styles.brow, {
              width: 10 * s, height: 2.5 * s,
              top: (eyeTop - 5 * s), left: 11 * s,
              transform: [{ rotate: "-20deg" }],
              backgroundColor: mood === "feral" ? "#4A1A1A" : "#6A3535",
            }]} />
            <View style={[styles.brow, {
              width: 10 * s, height: 2.5 * s,
              top: (eyeTop - 5 * s), right: 11 * s,
              transform: [{ rotate: "20deg" }],
              backgroundColor: mood === "feral" ? "#4A1A1A" : "#6A3535",
            }]} />
          </>
        )}

        {/* Smile for happy mood */}
        {showSmile && (
          <View style={[styles.mouth, {
            width: 14 * s, height: 6 * s,
            borderTopLeftRadius: 0, borderTopRightRadius: 0,
            borderBottomLeftRadius: 7 * s, borderBottomRightRadius: 7 * s,
            bottom: 14 * s,
            borderWidth: 2 * s, borderTopWidth: 0,
            borderColor: "#B06070",
            backgroundColor: "transparent",
          }]} />
        )}

        {/* Frown/snarl for dirty/feral */}
        {showFrown && (
          <View style={[styles.mouth, {
            width: 14 * s, height: 6 * s,
            borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
            borderTopLeftRadius: 7 * s, borderTopRightRadius: 7 * s,
            bottom: 14 * s,
            borderWidth: 2 * s, borderBottomWidth: 0,
            borderColor: mood === "feral" ? "#4A1A1A" : "#7A4040",
            backgroundColor: "transparent",
          }]} />
        )}

        {/* Snout */}
        <View
          style={[styles.snout, {
            width: 30 * s, height: 20 * s, borderRadius: 10 * s,
            bottom: 8 * s, backgroundColor: snoutColor,
          }]}
        >
          <View style={[styles.nostril, { width: 6 * s, height: 7 * s, borderRadius: 3 * s, left: 6 * s }]} />
          <View style={[styles.nostril, { width: 6 * s, height: 7 * s, borderRadius: 3 * s, right: 6 * s }]} />
        </View>
      </View>
    </Animated.View>
  );
}

export function PigIcon({ size = 24 }) {
  return <PigMascot size={size} animate={false} mood="happy" />;
}

const styles = StyleSheet.create({
  wrap: { position: "relative", alignItems: "center" },
  ear: { position: "absolute", zIndex: 0 },
  earLeft: { transform: [{ rotate: "-15deg" }] },
  earRight: { transform: [{ rotate: "15deg" }] },
  face: { position: "absolute", zIndex: 1, alignSelf: "center", overflow: "hidden" },
  eye: { position: "absolute", backgroundColor: "#2C2C2E", zIndex: 2 },
  tear: { position: "absolute", backgroundColor: "#7AC5E8", zIndex: 4 },
  brow: { position: "absolute", zIndex: 3, borderRadius: 1 },
  mud: { position: "absolute", zIndex: 0, opacity: 0.6 },
  mouth: { position: "absolute", alignSelf: "center", zIndex: 3 },
  snout: {
    position: "absolute", alignSelf: "center", zIndex: 2,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 2,
  },
  nostril: { backgroundColor: "#D07888" },
});
