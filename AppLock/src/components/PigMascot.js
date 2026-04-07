import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { PIG_SPEECH } from "../utils/pigWeight";

// Animated pig mascot — the USER is the pig.
// Moods: "dirty", "messy", "restless", "clean", "feral", "happy"
// Weight tiers: "starving","bony","scrawny","lean","average","plump","chubby","fat","obese","massive","legendary"

const WEIGHT_SCALE = {
  starving: 0.78,
  bony: 0.84,
  scrawny: 0.90,
  lean: 0.95,
  average: 1.0,
  plump: 1.07,
  chubby: 1.14,
  fat: 1.22,
  obese: 1.32,
  massive: 1.40,
  legendary: 1.48,
};

export default function PigMascot({ size = 80, animate = true, mood = "happy", weight = "average", showSpeech = false }) {
  const bob = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const tearOpacity = useRef(new Animated.Value(0)).current;
  const tearDrop = useRef(new Animated.Value(0)).current;
  const jiggle = useRef(new Animated.Value(0)).current;
  const speechOpacity = useRef(new Animated.Value(0)).current;
  const [speechText, setSpeechText] = useState("");

  useEffect(() => {
    if (!animate) return;

    const bobSpeed = mood === "feral" ? 300 : mood === "dirty" ? 600 : mood === "messy" ? 800 : mood === "restless" ? 1000 : 1200;
    const bobHeight = mood === "feral" ? -2 : mood === "dirty" ? -3 : mood === "messy" ? -4 : -6;

    const bobAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: bobHeight, duration: bobSpeed, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: bobSpeed, useNativeDriver: true }),
      ])
    );
    bobAnim.start();

    const blinkRate = mood === "feral" ? 800 : mood === "dirty" ? 1200 : mood === "messy" ? 2000 : 3500;
    const blinkInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.1, duration: 80, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    }, blinkRate);

    // Tears
    const tearInterval = mood === "feral" ? 4000 : mood === "dirty" ? 5000 : mood === "messy" ? 7000 : 10000;
    const tearTimer = setInterval(() => {
      tearDrop.setValue(0);
      Animated.parallel([
        Animated.timing(tearOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(tearDrop, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(tearOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      });
    }, tearInterval);

    // Jiggle — heavier pigs jiggle more
    const jiggleWeight = WEIGHT_SCALE[weight] || 1;
    const jiggleIntensity = jiggleWeight >= 1.07 ? (jiggleWeight - 1) * 8 : 0;
    let jiggleAnim;
    if (jiggleIntensity > 0) {
      jiggleAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(jiggle, { toValue: jiggleIntensity, duration: 120, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(jiggle, { toValue: -jiggleIntensity, duration: 120, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(jiggle, { toValue: jiggleIntensity * 0.5, duration: 100, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(jiggle, { toValue: -jiggleIntensity * 0.5, duration: 100, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(jiggle, { toValue: 0, duration: 80, easing: Easing.linear, useNativeDriver: true }),
          Animated.delay(2000),
        ])
      );
      jiggleAnim.start();
    }

    return () => {
      bobAnim.stop();
      clearInterval(blinkInterval);
      clearInterval(tearTimer);
      if (jiggleAnim) jiggleAnim.stop();
    };
  }, [animate, mood, weight]);

  // Speech bubble cycling
  useEffect(() => {
    if (!showSpeech) return;
    const messages = PIG_SPEECH[weight] || PIG_SPEECH.average;

    const showBubble = () => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setSpeechText(msg);
      Animated.sequence([
        Animated.timing(speechOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(4000),
        Animated.timing(speechOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    };

    // Show first bubble after a short delay
    const initialTimeout = setTimeout(showBubble, 2000);
    const interval = setInterval(showBubble, 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [showSpeech, weight]);

  const s = size / 80;
  const weightScaleX = WEIGHT_SCALE[weight] || 1.0;

  const showCheeks = weightScaleX >= 1.07;
  const showCrown = weight === "massive" || weight === "legendary";
  const showRibs = weight === "starving" || weight === "bony";

  // Mood colors
  const faceColor =
    mood === "feral" ? "#B85555" :
    mood === "dirty" ? "#C4795A" :
    mood === "messy" ? "#D4897A" :
    mood === "restless" ? "#F0A8A8" :
    "#FFB6C1";

  const earColor =
    mood === "feral" ? "#8B3535" :
    mood === "dirty" ? "#A06040" :
    mood === "messy" ? "#B0705F" :
    mood === "restless" ? "#D88A8A" :
    "#E8899A";

  const snoutColor =
    mood === "feral" ? "#A04545" :
    mood === "dirty" ? "#B06848" :
    mood === "messy" ? "#C07868" :
    mood === "restless" ? "#E09898" :
    "#F09AAF";

  const eyeHeight =
    mood === "feral" ? 3 * s :
    mood === "dirty" ? 4 * s :
    mood === "messy" ? 5 * s :
    mood === "restless" ? 7 * s :
    8 * s;

  const eyeTop =
    mood === "feral" ? 19 * s :
    mood === "dirty" ? 18 * s :
    mood === "messy" ? 17 * s :
    16 * s;

  const showAngryBrows = mood === "dirty" || mood === "messy" || mood === "feral";
  const showMudSplotches = mood === "dirty" || mood === "messy" || mood === "feral";
  const showSmile = mood === "clean" || mood === "happy";
  const showFrown = mood === "dirty" || mood === "feral";

  const cheekColor =
    mood === "feral" ? "#C06060" :
    mood === "dirty" ? "#D08A70" :
    mood === "messy" ? "#E09A8A" :
    "#FFB0B8";

  const jiggleRotate = jiggle.interpolate({
    inputRange: [-5, 5],
    outputRange: ["-2deg", "2deg"],
  });

  return (
    <View style={{ alignItems: "center" }}>
      {/* Speech bubble */}
      {showSpeech && speechText !== "" && (
        <Animated.View style={[styles.speechBubble, { opacity: speechOpacity }]}>
          <Text style={styles.speechText}>{speechText}</Text>
          <View style={styles.speechTail} />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.wrap,
          {
            width: size * weightScaleX,
            height: size,
            transform: [
              { translateY: bob },
              { scaleX: weightScaleX },
              { rotate: jiggleRotate },
            ],
          },
        ]}
      >
        {/* Crown for top tiers — drawn with Views */}
        {showCrown && (
          <View style={[styles.crown, { top: -1 * s }]}>
            <View style={styles.crownPoints}>
              <View style={[styles.crownPoint, { width: 5 * s, height: 5 * s }]} />
              <View style={[styles.crownPoint, { width: 5 * s, height: 7 * s, marginTop: -2 * s }]} />
              <View style={[styles.crownPoint, { width: 5 * s, height: 5 * s }]} />
            </View>
            <View style={[styles.crownBase, { width: 20 * s, height: 4 * s }]} />
          </View>
        )}

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
          {/* Mud splotches */}
          {showMudSplotches && (
            <>
              <View style={[styles.mud, {
                width: 8 * s, height: 6 * s, borderRadius: 3 * s,
                top: 10 * s, left: 8 * s,
                backgroundColor: mood === "feral" ? "#6B3030" : mood === "dirty" ? "#8A5030" : "#A06050",
              }]} />
              <View style={[styles.mud, {
                width: 6 * s, height: 5 * s, borderRadius: 3 * s,
                top: 30 * s, right: 10 * s,
                backgroundColor: mood === "feral" ? "#6B3030" : mood === "dirty" ? "#8A5030" : "#A06050",
              }]} />
              <View style={[styles.mud, {
                width: 5 * s, height: 4 * s, borderRadius: 2 * s,
                bottom: 18 * s, left: 18 * s,
                backgroundColor: mood === "feral" ? "#5A2525" : mood === "dirty" ? "#7A4525" : "#906050",
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

          {/* Tears */}
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

          {/* Angry brows */}
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

          {/* Smile */}
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

          {/* Frown */}
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

          {/* Puffy cheeks for heavier pigs */}
          {showCheeks && (
            <>
              <View style={[styles.cheek, {
                width: 10 * s, height: 8 * s, borderRadius: 5 * s,
                bottom: 16 * s, left: 2 * s,
                backgroundColor: cheekColor, opacity: 0.5,
              }]} />
              <View style={[styles.cheek, {
                width: 10 * s, height: 8 * s, borderRadius: 5 * s,
                bottom: 16 * s, right: 2 * s,
                backgroundColor: cheekColor, opacity: 0.5,
              }]} />
            </>
          )}

          {/* Ribs for starving/bony */}
          {showRibs && (
            <>
              <View style={[styles.rib, { top: 28 * s, left: 10 * s, width: 12 * s, height: 1.5 * s }]} />
              <View style={[styles.rib, { top: 33 * s, left: 8 * s, width: 14 * s, height: 1.5 * s }]} />
              <View style={[styles.rib, { top: 38 * s, left: 10 * s, width: 12 * s, height: 1.5 * s }]} />
            </>
          )}
        </View>
      </Animated.View>
    </View>
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
  cheek: { position: "absolute", zIndex: 1 },
  rib: { position: "absolute", backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 1, zIndex: 1 },
  crown: { position: "absolute", alignSelf: "center", zIndex: 10, alignItems: "center" },
  crownPoints: { flexDirection: "row", alignItems: "flex-end", gap: 1 },
  crownPoint: { backgroundColor: "#FFD700", borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  crownBase: { backgroundColor: "#FFD700", borderRadius: 1, marginTop: -1 },
  // Speech bubble
  speechBubble: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 180,
    alignSelf: "center",
  },
  speechText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E8668A",
    textAlign: "center",
  },
  speechTail: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    left: "45%",
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFF",
  },
});
