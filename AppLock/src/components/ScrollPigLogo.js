import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PINK = "#F7A0B2";

// Wordmark: heavy pink "ScrollPig" inside a thick pink pill on white
export default function ScrollPigLogo({ height = 44, style }) {
  const border = Math.round(height * 0.11);
  const fontSize = Math.round(height * 0.5);
  return (
    <View
      style={[styles.pill, { height, borderRadius: height / 2, borderWidth: border, paddingHorizontal: height * 0.36 }, style]}
      accessibilityRole="header"
      accessibilityLabel="ScrollPig"
    >
      <Text style={[styles.word, { fontSize, letterSpacing: -fontSize * 0.04 }]} allowFontScaling={false}>
        ScrollPig
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderColor: PINK,
    shadowColor: PINK,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  word: { color: PINK, fontWeight: "900", includeFontPadding: false, marginTop: -1 },
});
