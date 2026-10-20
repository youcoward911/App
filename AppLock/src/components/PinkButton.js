import React, { useRef } from "react";
import { View, Text, Pressable, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Glossy pink pill (the Pig Locker / level-up button style), full width by default
export default function PinkButton({ title, onPress, chevron = true, style, disabled }) {
  const press = useRef(new Animated.Value(0)).current;
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });
  const drop = press.interpolate({ inputRange: [0, 1], outputRange: [0, 2] });

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => Animated.spring(press, { toValue: 1, tension: 300, friction: 20, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(press, { toValue: 0, tension: 200, friction: 8, useNativeDriver: true }).start()}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={style}
    >
      <Animated.View style={[styles.btn, disabled && { opacity: 0.6 }, { transform: [{ scale }, { translateY: drop }] }]}>
        <View style={styles.fill}>
          <LinearGradient
            colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]}
            locations={[0, 0.45, 1]}
            style={styles.shine}
            pointerEvents="none"
          />
          <Text style={styles.text}>{title}</Text>
          {chevron && <Text style={styles.chevron}>›</Text>}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 20,
    backgroundColor: "#F7A0B2",
    shadowColor: "#E97C95",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  fill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    overflow: "hidden",
  },
  shine: { position: "absolute", top: 0, left: 0, right: 0, height: "75%" },
  text: { fontSize: 17, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.3 },
  chevron: { fontSize: 24, fontWeight: "600", color: "#FFFFFF", marginTop: -3 },
});
