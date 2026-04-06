import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fetchAppIcon, getCachedIcon } from "../utils/iconFetcher";

// Renders real app icons fetched from Apple's iTunes API
// Falls back to brand-colored letter icon if unavailable
export default function AppIcon({ app, size = 44 }) {
  const radius = size * 0.22;
  const [iconUrl, setIconUrl] = useState(() => getCachedIcon(app.name, app.bundleId));

  useEffect(() => {
    if (iconUrl) return;
    if (!app.bundleId) return;

    let cancelled = false;
    fetchAppIcon(app.name, app.bundleId).then((url) => {
      if (!cancelled && url) setIconUrl(url);
    });
    return () => { cancelled = true; };
  }, [app.bundleId]);

  // Real icon from iTunes
  if (iconUrl) {
    return (
      <Image
        source={{ uri: iconUrl }}
        style={[styles.image, { width: size, height: size, borderRadius: radius }]}
      />
    );
  }

  // Fallback: letter icon
  const fontSize = size * 0.42;
  const isSnapchat = app.id === "snapchat";

  return (
    <LinearGradient
      colors={app.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.icon, { width: size, height: size, borderRadius: radius }]}
    >
      <Text style={[styles.letter, { fontSize, color: isSnapchat ? "#000" : "#FFF" }]}>
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
  image: {
    backgroundColor: "#F0F0F0",
  },
});
