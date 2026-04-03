import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Renders a brand-colored rounded square icon like iOS app icons
export default function AppIcon({ app, size = 44 }) {
  const radius = size * 0.22; // iOS icon corner ratio
  const fontSize = size * 0.42;
  const isSnapchat = app.id === "snapchat";

  return (
    <LinearGradient
      colors={app.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.icon,
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
      ]}
    >
      <Text
        style={[
          styles.letter,
          {
            fontSize,
            color: isSnapchat ? "#000" : "#FFF",
          },
        ]}
      >
        {app.letter}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    fontWeight: "800",
    fontFamily: "System",
  },
});
