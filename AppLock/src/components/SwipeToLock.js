import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
} from "react-native";
import { C, T } from "../utils/theme";

const SWIPE_THRESHOLD = 120;

export default function SwipeToLock({ children, onLock, locked, style }) {
  const pan = useRef(new Animated.Value(0)).current;
  const triggered = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Only capture horizontal swipes
        return !locked && Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy);
      },
      onPanResponderMove: (_, gesture) => {
        if (triggered.current || locked) return;
        // Only allow right swipe
        const x = Math.max(0, gesture.dx);
        pan.setValue(x);
      },
      onPanResponderRelease: (_, gesture) => {
        if (triggered.current || locked) return;
        if (gesture.dx >= SWIPE_THRESHOLD) {
          triggered.current = true;
          Animated.timing(pan, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            if (onLock) onLock();
            setTimeout(() => {
              triggered.current = false;
              pan.setValue(0);
            }, 300);
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const bgOpacity = pan.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, style]}>
      {/* Reveal behind — lock text */}
      {!locked && (
        <Animated.View style={[styles.revealBg, { opacity: bgOpacity }]}>
          <Text style={styles.revealText}>LOCK IT</Text>
        </Animated.View>
      )}
      {/* Sliding content */}
      <Animated.View
        style={{ transform: [{ translateX: pan }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 14,
    marginBottom: 8,
  },
  revealBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.pink,
    borderRadius: 14,
    justifyContent: "center",
    paddingLeft: 20,
  },
  revealText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
