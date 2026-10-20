import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused } from "@react-navigation/native";
import { lightTap, successTap } from "../utils/haptics";

const PINK = "#F7A0B2";
const FILL_MS = 1100;

// Glowing XP bar. Gains animate only while the screen is focused, so progress
// earned on another screen (unlock modal, block screen) plays out on return.
// A level-up fills to the end, wraps to empty, then fills to the new progress.
export default function XPBar({ progress, level, height = 8, style }) {
  const isFocused = useIsFocused();
  const [trackW, setTrackW] = useState(0);
  const fill = useRef(new Animated.Value(progress)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const sheen = useRef(new Animated.Value(0)).current;
  const shown = useRef({ progress, level });

  useEffect(() => {
    if (!isFocused) return;
    const prev = shown.current;
    if (prev.progress === progress && prev.level === level) return;
    shown.current = { progress, level };

    const leveledUp = level > prev.level;
    fill.stopAnimation();
    if (!leveledUp && progress <= prev.progress) {
      fill.setValue(progress);
      return;
    }

    const fillTo = (toValue, duration = FILL_MS) =>
      Animated.timing(fill, { toValue, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    const fillAnim = leveledUp
      ? Animated.sequence([
          fillTo(1, 700),
          Animated.timing(fill, { toValue: 0, duration: 0, useNativeDriver: false }),
          fillTo(progress),
        ])
      : fillTo(progress);

    glow.setValue(0);
    sheen.setValue(0);
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        fillAnim,
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.delay(FILL_MS - 300),
          Animated.timing(glow, { toValue: 0, duration: 700, useNativeDriver: false }),
        ]),
        Animated.timing(sheen, { toValue: 1, duration: FILL_MS + 300, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ]),
    ]).start(({ finished }) => {
      if (finished) (leveledUp ? successTap : lightTap)();
    });
  }, [isFocused, progress, level]);

  const radius = height / 2;
  const fillWidth = fill.interpolate({
    inputRange: [0, 0.02, 1],
    outputRange: [height, Math.max(height, trackW * 0.02), Math.max(height, trackW)],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.glowWrap,
        {
          borderRadius: radius,
          shadowOpacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.95] }),
          shadowRadius: glow.interpolate({ inputRange: [0, 1], outputRange: [5, 11] }),
        },
        style,
      ]}
    >
      <View
        style={[styles.track, { height, borderRadius: radius }]}
        onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
      >
        {trackW > 0 && (
          <Animated.View style={[styles.fill, { width: fillWidth, borderRadius: radius }]}>
            <LinearGradient
              colors={["#FBC3CF", PINK, "#F48DA4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Gloss on the top half */}
            <View style={[styles.gloss, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]} />
            {/* Shine that sweeps across while filling */}
            <Animated.View
              style={[
                styles.sheen,
                {
                  opacity: glow,
                  transform: [{ translateX: sheen.interpolate({ inputRange: [0, 1], outputRange: [-40, trackW] }) }],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.85)", "rgba(255,255,255,0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glowWrap: {
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 0 },
  },
  track: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    overflow: "hidden",
  },
  fill: { height: "100%", overflow: "hidden" },
  gloss: {
    position: "absolute", top: 0, left: 0, right: 0, height: "45%",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  sheen: { position: "absolute", top: 0, bottom: 0, width: 40 },
});

// "12 / 20" text that counts up in step with XPBar's fill (same delay and easing).
// On a level-up it counts to the old level's max, then from 0 to the new value.
export function XPCount({ value, max, level, style }) {
  const isFocused = useIsFocused();
  const anim = useRef(new Animated.Value(value)).current;
  const [shownValue, setShownValue] = useState(value);
  const [shownMax, setShownMax] = useState(max);
  const shown = useRef({ value, max, level });

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setShownValue(Math.round(v)));
    return () => anim.removeListener(id);
  }, []);

  useEffect(() => {
    if (!isFocused) return;
    const prev = shown.current;
    if (prev.value === value && prev.level === level && prev.max === max) return;
    shown.current = { value, max, level };

    const leveledUp = level > prev.level;
    anim.stopAnimation();
    if (!leveledUp && value <= prev.value) {
      anim.setValue(value);
      setShownMax(max);
      return;
    }

    const countTo = (toValue, duration = FILL_MS) =>
      Animated.timing(anim, { toValue, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    Animated.sequence([
      Animated.delay(250),
      ...(leveledUp
        ? [
            countTo(prev.max || prev.value, 700),
            Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: false }),
          ]
        : []),
    ]).start(({ finished }) => {
      if (!finished) return;
      setShownMax(max);
      countTo(value).start();
    });
  }, [isFocused, value, max, level]);

  return <Text style={style}>{shownValue} / {shownMax || "MAX"}</Text>;
}
