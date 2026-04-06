import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
} from "react-native";
import { C } from "../utils/theme";

const TRACK_W = 150;
const THUMB_SIZE = 46;
const MAX_SLIDE = TRACK_W - THUMB_SIZE - 8;

export default function SlideToLock({ onLock, locked }) {
  const pan = useRef(new Animated.Value(0)).current;
  const triggered = useRef(false);
  const lastDx = useRef(0);

  const snapToLock = () => {
    triggered.current = true;
    Animated.timing(pan, {
      toValue: MAX_SLIDE,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      if (onLock) onLock();
      setTimeout(() => {
        triggered.current = false;
        lastDx.current = 0;
        pan.setValue(0);
      }, 500);
    });
  };

  const snapBack = () => {
    lastDx.current = 0;
    Animated.timing(pan, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !locked && !triggered.current,
      onMoveShouldSetPanResponder: (_, g) => !locked && !triggered.current && g.dx > 3,
      onPanResponderMove: (_, g) => {
        if (triggered.current || locked) return;
        const x = Math.max(0, Math.min(g.dx, MAX_SLIDE));
        lastDx.current = x;
        pan.setValue(x);

        // Auto-magnet: if past halfway, snap to lock immediately
        if (x >= MAX_SLIDE * 0.5) {
          snapToLock();
        }
      },
      onPanResponderRelease: () => {
        if (triggered.current || locked) return;
        // Anything less than 50% snaps back
        snapBack();
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
