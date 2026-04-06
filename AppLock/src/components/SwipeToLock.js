import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
} from "react-native";
import { C } from "../utils/theme";

const TRACK_W = 130;
const THUMB_SIZE = 32;
const MAX_SLIDE = TRACK_W - THUMB_SIZE - 6;

export default function SlideToLock({ onLock, locked }) {
  const pan = useRef(new Animated.Value(0)).current;
  const triggered = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !locked,
      onMoveShouldSetPanResponder: (_, g) => !locked && Math.abs(g.dx) > 5,
      onPanResponderMove: (_, g) => {
        if (triggered.current || locked) return;
        pan.setValue(Math.max(0, Math.min(g.dx, MAX_SLIDE)));
      },
      onPanResponderRelease: (_, g) => {
        if (triggered.current || locked) return;
        if (g.dx >= MAX_SLIDE * 0.8) {
          triggered.current = true;
          Animated.spring(pan, {
            toValue: MAX_SLIDE,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }).start(() => {
            if (onLock) onLock();
            setTimeout(() => {
              triggered.current = false;
              pan.setValue(0);
            }, 500);
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            tension: 100,
            friction: 10,
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
        >
          <Text style={styles.thumbArrow}>→</Text>
        </Animated.View>
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
    height: THUMB_SIZE + 6,
    borderRadius: (THUMB_SIZE + 6) / 2,
    backgroundColor: "#FFE0EE",
    justifyContent: "center",
    paddingHorizontal: 3,
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
  thumbArrow: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
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
    height: THUMB_SIZE + 6,
    borderRadius: (THUMB_SIZE + 6) / 2,
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
