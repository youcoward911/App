import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

// Animated pig mascot built with pure RN Views — no emojis
// Supports mood prop: "normal", "solemn", "pain", "crying"

export default function PigMascot({ size = 80, animate = true, mood = "normal" }) {
  const bob = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animate) return;

    const bobSpeed = mood === "crying" ? 800 : mood === "pain" ? 1000 : 1200;
    const bobHeight = mood === "crying" ? -3 : mood === "pain" ? -4 : -6;

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

    const blinkRate = mood === "pain" || mood === "crying" ? 1500 : 3500;
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

    return () => clearInterval(blinkInterval);
  }, [animate, mood]);

  const s = size / 80;

  // Colors change based on mood
  const faceColor =
    mood === "crying" ? "#FF8A8A" :
    mood === "pain" ? "#FFA0A0" :
    mood === "solemn" ? "#FFBCC7" :
    "#FFB6C1";

  const earColor =
    mood === "crying" ? "#D06070" :
    mood === "pain" ? "#D87888" :
    "#E8899A";

  const snoutColor =
    mood === "crying" ? "#E07080" :
    mood === "pain" ? "#E08898" :
    "#F09AAF";

  // Eye shape changes with mood
  const eyeHeight =
    mood === "crying" ? 5 * s :
    mood === "pain" ? 4 * s :
    8 * s;

  const eyeTop =
    mood === "crying" ? 18 * s :
    mood === "pain" ? 19 * s :
    16 * s;

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
          styles.ear,
          styles.earLeft,
          {
            width: 22 * s,
            height: 26 * s,
            borderRadius: 8 * s,
            top: 2 * s,
            left: 6 * s,
            backgroundColor: earColor,
          },
        ]}
      />
      <View
        style={[
          styles.ear,
          styles.earRight,
          {
            width: 22 * s,
            height: 26 * s,
            borderRadius: 8 * s,
            top: 2 * s,
            right: 6 * s,
            backgroundColor: earColor,
          },
        ]}
      />

      {/* Face */}
      <View
        style={[
          styles.face,
          {
            width: 64 * s,
            height: 60 * s,
            borderRadius: 30 * s,
            top: 12 * s,
            backgroundColor: faceColor,
          },
        ]}
      >
        {/* Eyes */}
        <Animated.View
          style={[
            styles.eye,
            {
              width: 8 * s,
              height: eyeHeight,
              borderRadius: 4 * s,
              top: eyeTop,
              left: 14 * s,
              transform: [{ scaleY: blink }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.eye,
            {
              width: 8 * s,
              height: eyeHeight,
              borderRadius: 4 * s,
              top: eyeTop,
              right: 14 * s,
              transform: [{ scaleY: blink }],
            },
          ]}
        />

        {/* Eyebrows for sad moods */}
        {(mood === "solemn" || mood === "pain" || mood === "crying") && (
          <>
            <View
              style={[
                styles.brow,
                {
                  width: 10 * s,
                  height: 2 * s,
                  top: (eyeTop - 4 * s),
                  left: 12 * s,
                  transform: [{ rotate: "15deg" }],
                  backgroundColor: mood === "crying" ? "#8B3A3A" : "#7A5555",
                },
              ]}
            />
            <View
              style={[
                styles.brow,
                {
                  width: 10 * s,
                  height: 2 * s,
                  top: (eyeTop - 4 * s),
                  right: 12 * s,
                  transform: [{ rotate: "-15deg" }],
                  backgroundColor: mood === "crying" ? "#8B3A3A" : "#7A5555",
                },
              ]}
            />
          </>
        )}

        {/* Tears for crying mood */}
        {mood === "crying" && (
          <>
            <View
              style={[
                styles.tear,
                {
                  width: 4 * s,
                  height: 8 * s,
                  borderRadius: 2 * s,
                  top: (eyeTop + 6 * s),
                  left: 16 * s,
                },
              ]}
            />
            <View
              style={[
                styles.tear,
                {
                  width: 4 * s,
                  height: 8 * s,
                  borderRadius: 2 * s,
                  top: (eyeTop + 6 * s),
                  right: 16 * s,
                },
              ]}
            />
          </>
        )}

        {/* Mouth — frown for sad moods */}
        {(mood === "solemn" || mood === "pain" || mood === "crying") && (
          <View
            style={[
              styles.mouth,
              {
                width: 12 * s,
                height: 6 * s,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderTopLeftRadius: 6 * s,
                borderTopRightRadius: 6 * s,
                bottom: 14 * s,
                borderWidth: 2 * s,
                borderBottomWidth: 0,
                borderColor: mood === "crying" ? "#8B3A3A" : "#B06070",
                backgroundColor: "transparent",
              },
            ]}
          />
        )}

        {/* Snout */}
        <View
          style={[
            styles.snout,
            {
              width: 30 * s,
              height: 20 * s,
              borderRadius: 10 * s,
              bottom: 8 * s,
              backgroundColor: snoutColor,
            },
          ]}
        >
          <View
            style={[
              styles.nostril,
              {
                width: 6 * s,
                height: 7 * s,
                borderRadius: 3 * s,
                left: 6 * s,
              },
            ]}
          />
          <View
            style={[
              styles.nostril,
              {
                width: 6 * s,
                height: 7 * s,
                borderRadius: 3 * s,
                right: 6 * s,
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

export function PigIcon({ size = 24 }) {
  return <PigMascot size={size} animate={false} />;
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    alignItems: "center",
  },
  ear: {
    position: "absolute",
    zIndex: 0,
  },
  earLeft: {
    transform: [{ rotate: "-15deg" }],
  },
  earRight: {
    transform: [{ rotate: "15deg" }],
  },
  face: {
    position: "absolute",
    zIndex: 1,
    alignSelf: "center",
  },
  eye: {
    position: "absolute",
    backgroundColor: "#2C2C2E",
    zIndex: 2,
  },
  brow: {
    position: "absolute",
    zIndex: 3,
    borderRadius: 1,
  },
  tear: {
    position: "absolute",
    backgroundColor: "#5CB8FF",
    zIndex: 3,
  },
  mouth: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 3,
  },
  snout: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  nostril: {
    backgroundColor: "#D07888",
  },
});
