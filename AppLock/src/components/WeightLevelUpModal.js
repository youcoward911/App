import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Modal, Animated, Easing, Dimensions } from "react-native";
import PigMascot from "./PigMascot";
import GlowButton from "./GlowButton";
import { C, T } from "../utils/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const CONFETTI_COUNT = 40;

const LEVEL_UP_MESSAGES = [
  "Someone's getting bigger!",
  "Nice belly full of slop!",
  "Scroll, scroll, scroll your feed, gently on your phone...",
  "Look at those rolls. Beautiful.",
  "The trough is proud of you.",
  "Getting rounder by the minute!",
  "Oink oink! New weight class!",
  "Your belly is dragging on the floor now.",
  "That slop is going straight to your cheeks.",
  "Another chin unlocked!",
  "You can barely fit through the pen door.",
  "More slop, more rolls, more shame.",
  "Your master would be so proud. So, so proud.",
  "Waddle waddle waddle...",
  "The scale is crying.",
  "Stuffed and still eating. Classic.",
  "Row, row, row your trough...",
  "Fatter. Rounder. Weaker.",
  "Your gravity is increasing.",
  "They can see you from space now.",
];

function Confetti() {
  const pieces = useRef(
    Array.from({ length: CONFETTI_COUNT }, () => ({
      x: new Animated.Value(Math.random() * SCREEN_W),
      y: new Animated.Value(-20 - Math.random() * 60),
      rotate: new Animated.Value(0),
      color: ["#FF69B4", "#FFD700", "#FF6B9D", "#FFA0C4", "#FF85A2", "#FFB6C1", "#E8668A"][
        Math.floor(Math.random() * 7)
      ],
      size: 6 + Math.random() * 8,
      speed: 2000 + Math.random() * 3000,
      drift: (Math.random() - 0.5) * 100,
    }))
  ).current;

  useEffect(() => {
    pieces.forEach((p) => {
      const fall = () => {
        p.y.setValue(-20 - Math.random() * 60);
        p.x.setValue(Math.random() * SCREEN_W);
        p.rotate.setValue(0);
        Animated.parallel([
          Animated.timing(p.y, {
            toValue: SCREEN_H + 20,
            duration: p.speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(p.x, {
            toValue: p.x._value + p.drift,
            duration: p.speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(p.rotate, {
            toValue: 360 * (Math.random() > 0.5 ? 1 : -1),
            duration: p.speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]).start(() => fall());
      };
      // Stagger start
      setTimeout(fall, Math.random() * 1500);
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: 2,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              {
                rotate: p.rotate.interpolate({
                  inputRange: [-360, 360],
                  outputRange: ["-360deg", "360deg"],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

export default function WeightLevelUpModal({ visible, onDismiss, oldWeight, newWeight }) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (visible) {
      setMessage(LEVEL_UP_MESSAGES[Math.floor(Math.random() * LEVEL_UP_MESSAGES.length)]);
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Confetti />
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={styles.levelUpTitle}>WEIGHT CLASS UP</Text>

          {/* Before → After pigs */}
          <View style={styles.evolutionRow}>
            <View style={styles.pigStage}>
              <PigMascot size={50} mood="restless" weight={oldWeight} animate={false} />
              <Text style={styles.stageLabel}>{oldWeight}</Text>
            </View>
            <Text style={styles.arrow}>{">"}</Text>
            <View style={styles.pigStage}>
              <PigMascot size={65} mood="happy" weight={newWeight} />
              <Text style={[styles.stageLabel, styles.stageLabelNew]}>{newWeight}</Text>
            </View>
          </View>

          <Text style={styles.message}>{message}</Text>

          <GlowButton
            title="Oink"
            onPress={onDismiss}
            style={{ marginTop: 20 }}
            textStyle={{ fontSize: 16, letterSpacing: 1 }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 28,
    width: SCREEN_W - 64,
    alignItems: "center",
    shadowColor: "#FF69B4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  levelUpTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: C.pink,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  evolutionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 20,
  },
  pigStage: {
    alignItems: "center",
  },
  stageLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  stageLabelNew: {
    color: C.pink,
    fontWeight: "900",
  },
  arrow: {
    fontSize: 24,
    fontWeight: "900",
    color: C.pink,
    marginHorizontal: 4,
  },
  message: {
    ...T.body,
    textAlign: "center",
    fontStyle: "italic",
    color: C.textSecondary,
    lineHeight: 22,
  },
});
