import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { C } from "../utils/theme";
import { lightTap, mediumTap, heavyTap, selectionTick, successTap } from "../utils/haptics";

const { width: SCREEN_W } = require("react-native").Dimensions.get("window");
const TRACK_W = SCREEN_W - 40;
const THUMB_SIZE = 54;
const MAX_SLIDE = TRACK_W - THUMB_SIZE - 12;
const RESIST_START = MAX_SLIDE * 0.7; // past here the thumb lags the finger, like pushing a latch
const RESIST = 0.65;
const LOCK_ON_DRAG = MAX_SLIDE * 0.92;
const LOCK_ON_RELEASE = MAX_SLIDE * 0.75;
const TICK_STEPS = 18;

// Ticks get denser (progress squared) and stronger toward the end
function tickStep(x) {
  const p = x / MAX_SLIDE;
  return Math.floor(p * p * TICK_STEPS);
}
function tick(x) {
  const p = x / MAX_SLIDE;
  if (p < 0.35) selectionTick();
  else if (p < 0.65) lightTap();
  else if (p < 0.85) mediumTap();
  else heavyTap();
}

// Finger offset -> thumb offset, with rubber-band resistance near the end
function thumbX(dx) {
  const x = Math.max(0, dx);
  const resisted = x <= RESIST_START ? x : RESIST_START + (x - RESIST_START) * RESIST;
  return Math.min(resisted, MAX_SLIDE);
}

export default function SlideToLock({ onLock, locked }) {
  const pan = useRef(new Animated.Value(0)).current;
  const triggered = useRef(false);
  const lastDx = useRef(0);
  const lastStep = useRef(0);
  const grab = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const shackle = useRef(new Animated.Value(0)).current; // 0 open, 1 closed
  const flash = useRef(new Animated.Value(0)).current;

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

  const setGrabbed = (on) => {
    Animated.spring(grab, { toValue: on ? 1 : 0, tension: 220, friction: 12, useNativeDriver: true }).start();
  };

  const snapToLock = () => {
    triggered.current = true;
    setGrabbed(false);
    Animated.timing(pan, {
      toValue: MAX_SLIDE,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      successTap();
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pop, { toValue: 1, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(pop, { toValue: 0, tension: 180, friction: 6, useNativeDriver: true }),
        ]),
        Animated.spring(shackle, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(flash, { toValue: 1, duration: 90, useNativeDriver: true }),
          Animated.timing(flash, { toValue: 0, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]).start();
      setTimeout(() => {
        if (onLock) onLock();
      }, 150);
      setTimeout(() => {
        triggered.current = false;
        lastDx.current = 0;
        lastStep.current = 0;
        pan.setValue(0);
        shackle.setValue(0);
      }, 900);
    });
  };

  const snapBack = (vx = 0) => {
    lastDx.current = 0;
    lastStep.current = 0;
    setGrabbed(false);
    Animated.spring(pan, {
      toValue: 0,
      velocity: vx,
      tension: 140,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !locked && !triggered.current,
      onMoveShouldSetPanResponder: (_, g) => !locked && !triggered.current && g.dx > 2,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        if (triggered.current || locked) return;
        pan.stopAnimation();
        lightTap();
        setGrabbed(true);
      },
      onPanResponderMove: (_, g) => {
        if (triggered.current || locked) return;
        const x = thumbX(g.dx);
        lastDx.current = x;
        pan.setValue(x);
        const step = tickStep(x);
        if (step !== lastStep.current) {
          lastStep.current = step;
          tick(x);
        }
        if (x >= LOCK_ON_DRAG) {
          snapToLock();
        }
      },
      onPanResponderRelease: (_, g) => {
        if (triggered.current || locked) return;
        if (lastDx.current >= LOCK_ON_RELEASE) {
          snapToLock();
        } else {
          snapBack(g.vx);
        }
      },
      onPanResponderTerminate: () => {
        if (triggered.current || locked) return;
        snapBack();
      },
    })
  ).current;

  const thumbScale = Animated.add(
    grab.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }),
    pop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] })
  );
  const shackleY = shackle.interpolate({ inputRange: [0, 1], outputRange: [-4, 0] });
  const fillX = Animated.subtract(pan, MAX_SLIDE);
  const fillOpacity = pan.interpolate({ inputRange: [0, MAX_SLIDE], outputRange: [0.35, 0.85], extrapolate: "clamp" });
  const glowOpacity = grab.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  // Stays under the thumb (max 1.08) so only its soft shadow shows
  const glowScale = grab.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.04] });

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
      {/* Progress fill trailing the thumb, plus the lock flash */}
      <View style={styles.fillClip} pointerEvents="none">
        <Animated.View style={[styles.fill, { opacity: fillOpacity, transform: [{ translateX: fillX }] }]}>
          <LinearGradient
            colors={["rgba(247,160,178,0.25)", "#F7A0B2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View style={[styles.flash, { opacity: flash }]} />
      </View>
      {/* Swipe text — gradient from pink to dark, with shimmer */}
      <Animated.View style={[styles.textWrap, { opacity: textOpacity }]}>
        <MaskedView
          maskElement={
            <Text style={styles.swipeTextMask} numberOfLines={1}>SWIPE TO LOCK SLOP</Text>
          }
        >
          <LinearGradient
            colors={["#F7A0B2", "#F7A0B2"]}
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
      <Animated.View style={{ transform: [{ translateX: pan }] }}>
        <Animated.View
          pointerEvents="none"
          style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
        />
        <Animated.View style={[styles.thumb, { transform: [{ scale: thumbScale }] }]}>
          <View style={styles.lockIcon}>
            <Animated.View style={[styles.lockShackle, { transform: [{ translateY: shackleY }] }]} />
            <View style={styles.lockBody} />
          </View>
        </Animated.View>
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
  glow: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#F7A0B2",
    shadowColor: "#F7A0B2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 22,
  },
  lockIcon: {
    width: 15,
    height: 17,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  lockShackle: {
    position: "absolute",
    top: 0,
    width: 10,
    height: 11,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderColor: "#8E8E93",
  },
  lockBody: {
    width: 15,
    height: 10,
    borderRadius: 2.5,
    backgroundColor: "#8E8E93",
  },
  fillClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    left: 5,
    top: 5,
    width: MAX_SLIDE + THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    overflow: "hidden",
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F7A0B2",
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
