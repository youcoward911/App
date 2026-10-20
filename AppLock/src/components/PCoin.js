import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PINK = "#F7A0B2";

// The circled-P coin logo: pink ring (same thickness ratio as the ScrollPig pill logo) around a pink P
export default function PCoin({ size = 24, style }) {
  const ring = Math.max(1.5, Math.round(size * 0.11 * 2) / 2);
  const fontSize = Math.round(size * 0.46);

  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderWidth: ring }, style]}>
      <Text style={[styles.p, { fontSize, lineHeight: fontSize + 2 }]}>P</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderColor: PINK,
    alignItems: "center",
    justifyContent: "center",
  },
  p: {
    color: PINK,
    fontWeight: "800",
    textAlign: "center",
    includeFontPadding: false,
    transform: [{ translateX: 0.5 }],
  },
});
