import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
} from "react-native";
import { C } from "../utils/theme";

const TRACK_W = 140;
const THUMB_SIZE = 40;
const MAX_SLIDE = TRACK_W - THUMB_SIZE - 8;

export default function SlideToLock({ onLock, locked }) {
  const pan = useRef(new Animated.Value(0)).current;
  const currentX = useRef(0);
  const triggered = useRef(false);

  // Track the current value for release logic
  pan.addListener(({ value }) => { currentX.current = value; });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !locked,
      onMoveShouldSetPanResponder: (_, g) => !locked && Math.abs(g.dx) > 5,
      onPanResponderGrant: () => {
        pan.setOffset(currentX.current);
        pan.setValue(0);
      },
      onPanResponderMove: (_, g) => {
        if (triggered.current || locked) return;
        const newVal = Math.max(-currentX.current, Math.min(g.dx, MAX_SLIDE - currentX.current));
        pan.setValue(newVal);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        if (triggered.current || locked) return;

        if (currentX.current >= MAX_SLIDE * 0.7) {
          // Past 70% — snap to end and lock
          triggered.current = true;
          Animated.timing(pan, {
            toValue: MAX_SLIDE,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            if (onLock) onLock();
            setTimeout(() => {
              triggered.current = false;
              currentX.current = 0;
              pan.setValue(0);
            }, 500);
          });
        } else {
          // Snap back smoothly
          Animated.timing(pan, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const shimmer = pan.interpolate({
    inputRange: [0, MAX_SLIDE * 0.3],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (locked) {
    return (
      <View style={styles.lockedWrap}>
        <Text style={styles.lockedText}>LOCKED</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <Animated.Text style={[styles.trackLabel, { opacity: shimmer }]}>
          ›››
        </Animated.Text>
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX: pan }] }]}
          {...panResponder.panHandlers}
        />
      </View>
      <Text style={styles.hint}>swipe to lock</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  track: {
    width: TRACK_W,
    height: THUMB_SIZE + 8,
    borderRadius: (THUMB_SIZE + 8) / 2,
    backgroundColor: "#FFE0EE",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  trackLabel: {
    position: "absolute",
    alignSelf: "center",
    fontSize: 16,
    fontWeight: "300",
    color: C.pinkLight,
    letterSpacing: 4,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  hint: {
    fontSize: 9,
    fontWeight: "500",
    color: C.textTertiary,
    letterSpacing: 0.5,
    marginTop: 3,
    textTransform: "uppercase",
  },
  lockedWrap: {
    width: TRACK_W,
    height: THUMB_SIZE + 8,
    borderRadius: (THUMB_SIZE + 8) / 2,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
});
