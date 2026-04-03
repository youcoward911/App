import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

// Animated pig mascot built with pure RN Views — no emojis
// A cute, minimal pig face that bobs gently

export default function PigMascot({ size = 80, animate = true }) {
  const bob = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animate) return;

    // Gentle bobbing
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -6,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Blinking
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
    }, 3500);

    return () => clearInterval(blinkInterval);
  }, [animate]);

  const s = size / 80; // scale factor

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
          },
        ]}
      >
        {/* Eyes */}
        <Animated.View
          style={[
            styles.eye,
            styles.eyeLeft,
            {
              width: 8 * s,
              height: 8 * s,
              borderRadius: 4 * s,
              top: 16 * s,
              left: 14 * s,
              transform: [{ scaleY: blink }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.eye,
            styles.eyeRight,
            {
              width: 8 * s,
              height: 8 * s,
              borderRadius: 4 * s,
              top: 16 * s,
              right: 14 * s,
              transform: [{ scaleY: blink }],
            },
          ]}
        />

        {/* Snout */}
        <View
          style={[
            styles.snout,
            {
              width: 30 * s,
              height: 20 * s,
              borderRadius: 10 * s,
              bottom: 8 * s,
            },
          ]}
        >
          {/* Nostrils */}
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

// Smaller static pig for inline use (tab bar, headers)
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
    backgroundColor: "#E8899A",
    zIndex: 0,
    transform: [{ rotate: "-15deg" }],
  },
  earLeft: {
    transform: [{ rotate: "-15deg" }],
  },
  earRight: {
    transform: [{ rotate: "15deg" }],
  },
  face: {
    position: "absolute",
    backgroundColor: "#FFB6C1",
    zIndex: 1,
    alignSelf: "center",
  },
  eye: {
    position: "absolute",
    backgroundColor: "#2C2C2E",
    zIndex: 2,
  },
  eyeLeft: {},
  eyeRight: {},
  snout: {
    position: "absolute",
    backgroundColor: "#F09AAF",
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
