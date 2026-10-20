import React, { useEffect, useRef, useState } from "react";
import { View, Text, Modal, Pressable, Animated, Easing, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lightTap, successTap } from "../utils/haptics";

// Set to "pending" when onboarding finishes on a fresh install; "done" once shown or skipped
export const TUTORIAL_KEY = "@scrollpig_home_tutorial";

const PINK = "#F7A0B2";
const DIM = "rgba(26,12,18,0.62)";
const PAD = 8;
const CARD_W = 300;
const SPREAD = 2000; // dim border thickness: enough to cover any screen from the spotlight

// Spotlight walkthrough. `steps` = [{ rect: {x, y, width, height}, title, body }] in window coords.
// Tap anywhere for the next step; Skip ends it.
export default function HomeTutorial({ steps, onDone }) {
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const { width: W, height: H } = Dimensions.get("window");

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [i]);

  const step = steps[i];
  if (!step) return null;
  const last = i === steps.length - 1;
  const next = () => {
    if (last) { successTap(); onDone(); return; }
    lightTap();
    setI(i + 1);
  };
  const back = () => {
    lightTap();
    setI(Math.max(0, i - 1));
  };

  const hole = {
    x: Math.max(0, step.rect.x - PAD),
    y: Math.max(0, step.rect.y - PAD),
    w: Math.min(W, step.rect.width + PAD * 2),
    h: step.rect.height + PAD * 2,
  };
  // Pills (coin, swipe) get fully round ends; everything else a soft corner
  const radius = step.pill ? hole.h / 2 : Math.min(20, hole.h / 2);
  // Card goes below the spotlight when there's room, otherwise above it
  const below = hole.y + hole.h + 190 < H - insets.bottom;
  const cardTop = below ? hole.y + hole.h + 14 : undefined;
  const cardBottom = below ? undefined : H - hole.y + 14;
  const cardLeft = Math.min(Math.max(16, hole.x + hole.w / 2 - CARD_W / 2), W - CARD_W - 16);

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onDone}>
      <Pressable style={StyleSheet.absoluteFill} onPress={next} accessibilityRole="button" accessibilityLabel={last ? "Finish tour" : "Next tip"}>
        {/* Dim everything except a rounded spotlight: one view whose huge border is the dim
            layer, so its inner edge is a rounded cut-out matching the white ring */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: hole.x - SPREAD, top: hole.y - SPREAD,
            width: hole.w + SPREAD * 2, height: hole.h + SPREAD * 2,
            borderWidth: SPREAD, borderColor: DIM, borderRadius: radius + SPREAD,
          }}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.ring, { opacity: fade, left: hole.x, top: hole.y, width: hole.w, height: hole.h, borderRadius: radius }]}
        />

        <Animated.View
          style={[styles.card, { opacity: fade, left: cardLeft, top: cardTop, bottom: cardBottom, width: CARD_W }]}
        >
          <Text style={styles.count}>{i + 1} of {steps.length}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>
          <View style={styles.footer}>
            <View style={styles.dots}>
              {steps.map((_, d) => <View key={d} style={[styles.dot, d === i && styles.dotOn]} />)}
            </View>
            <View style={styles.actions}>
              {i > 0 && (
                <Pressable onPress={back} hitSlop={10} accessibilityRole="button" accessibilityLabel="Previous tip">
                  <Text style={styles.backText}>‹ Back</Text>
                </Pressable>
              )}
              {/* Skip lives in the card so it never covers the spotlight */}
              {!last && (
                <Pressable onPress={() => { lightTap(); onDone(); }} hitSlop={10} accessibilityRole="button" accessibilityLabel="Skip tour">
                  <Text style={styles.skipText}>Skip</Text>
                </Pressable>
              )}
              <Pressable onPress={next} style={styles.nextBtn} hitSlop={8}>
                <Text style={styles.nextText}>{last ? "Let's go" : "Next"}</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  ring: { position: "absolute", borderWidth: 2.5, borderColor: "#FFFFFF" },
  card: {
    position: "absolute", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 18,
    shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
  },
  count: { fontSize: 11, fontWeight: "800", color: PINK, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 },
  title: { fontSize: 19, fontWeight: "900", color: "#2D2D2D", letterSpacing: -0.4, marginBottom: 6 },
  body: { fontSize: 14, fontWeight: "500", color: "#4A4044", lineHeight: 20 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(247,160,178,0.35)" },
  dotOn: { backgroundColor: PINK, width: 18 },
  nextBtn: { backgroundColor: PINK, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 20 },
  nextText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  actions: { flexDirection: "row", alignItems: "center", gap: 14 },
  backText: { color: "#F7A0B2", fontSize: 14, fontWeight: "800" },
  skipText: { color: "#2D2D2D", fontSize: 14, fontWeight: "700", opacity: 0.55 },
});
