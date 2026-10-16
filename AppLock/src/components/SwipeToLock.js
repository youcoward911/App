import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { C } from "../utils/theme";
import { heavyTap } from "../utils/haptics";

const ICON_LOCK = require("../../assets/icon-lock-slider.png");

const { width: SCREEN_W } = require("react-native").Dimensions.get("window");
const TRACK_W = SCREEN_W - 40;
const THUMB_SIZE = 54;
const MAX_SLIDE = TRACK_W - THUMB_SIZE - 12;

export default function SlideToLock({ onLock, locked }) {
  const pan = useRef(new Animated.Value(0)).current;
  const triggered = useRef(false);
  const lastDx = useRef(0);

  // Shimmer animation — sweeps across the text
  const shimmerPos = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (locked) return;
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerPos, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shimmerPos, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(1000),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [locked]);

  const shimmerTranslateX = shimmerPos.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 250],
  });

  const snapToLock = () => {
    triggered.current = true;
    Animated.timing(pan, {
      toValue: MAX_SLIDE,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      heavyTap();
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
      onMoveShouldSetPanResponder: (_, g) => !locked && !triggered.current && g.dx > 2,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        if (triggered.current || locked) return;
        const x = Math.max(0, Math.min(g.dx, MAX_SLIDE));
        lastDx.current = x;
        pan.setValue(x);
        if (x >= MAX_SLIDE * 0.4) {
          snapToLock();
        }
      },
      onPanResponderRelease: () => {
        if (triggered.current || locked) return;
        snapBack();
      },
    })
  ).current;

  const textOpacity = pan.interpolate({
    inputRange: [0, MAX_SLIDE * 0.3],
    outputRange: [0.8, 0],
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
    <View style={styles.track} {...panResponder.panHandlers}>
      {/* Swipe text — gradient from pink to dark, with shimmer */}
      <Animated.View style={[styles.textWrap, { opacity: textOpacity }]}>
        <MaskedView
          maskElement={
            <Text style={styles.swipeTextMask} numberOfLines={1}>SWIPE TO LOCK SLOP</Text>
          }
        >
          <LinearGradient
            colors={["#2D2D2D", "#2D2D2D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.swipeTextMask, { opacity: 0 }]} numberOfLines={1}>SWIPE TO LOCK SLOP</Text>
          </LinearGradient>
          {/* Shimmer overlay */}
          <Animated.View
            style={[styles.shimmer, { transform: [{ translateX: shimmerTranslateX }] }]}
            pointerEvents="none"
          />
        </MaskedView>
      </Animated.View>

      {/* Thumb — white circle with lock icon */}
      <Animated.View style={[styles.thumb, { transform: [{ translateX: pan }] }]}>
        <Image source={ICON_LOCK} style={styles.lockIcon} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: THUMB_SIZE + 10,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  textWrap: {
    position: "absolute",
    left: THUMB_SIZE + 10,
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  swipeTextMask: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#F5F3F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F7A0B2",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  lockIcon: {
    width: 15,
    height: 17,
    tintColor: "#2D2D2D",
  },
  lockedWrap: {
    width: TRACK_W,
    height: THUMB_SIZE + 10,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1.5,
    borderColor: "#2D2D2D",
    alignItems: "center",
    justifyContent: "center",
  },
  lockedText: {
    color: "#2D2D2D",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
});
