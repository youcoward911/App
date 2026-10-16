import React, { useRef } from "react";
import { Animated, TouchableOpacity, Text, StyleSheet } from "react-native";
import { C, T, NEON_GLOW } from "../utils/theme";
import { mediumTap, lightTap } from "../utils/haptics";

export default function GlowButton({ title, onPress, style, textStyle, ghost = false }) {
  const glow = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // Pulse glow on press
    Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 150, useNativeDriver: false }),
      Animated.timing(glow, { toValue: 0, duration: 400, useNativeDriver: false }),
    ]).start();
    mediumTap();
    if (onPress) onPress();
  };

  const glowRadius = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [NEON_GLOW.shadowRadius, 32],
  });

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [NEON_GLOW.shadowOpacity, 1],
  });

  if (ghost) {
    return (
      <TouchableOpacity style={[styles.ghost, style]} activeOpacity={0.7} onPress={() => { lightTap(); if (onPress) onPress(); }}>
        <Text style={[styles.ghostText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      style={[
        styles.glowWrap,
        {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        },
        style,
      ]}
    >
      <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={handlePress}>
        <Text style={[styles.btnText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glowWrap: {
    width: "100%",
    borderRadius: 14,
  },
  btn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  btnText: { ...T.button, color: "#2D2D2D", fontWeight: "500" },
  ghost: { paddingVertical: 10, alignItems: "center" },
  ghostText: { ...T.body, color: C.text, fontWeight: "600" },
});
