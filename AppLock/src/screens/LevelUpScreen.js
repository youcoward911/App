import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import PigIdleWebView from "../components/PigIdleWebView";
import ScrollPigAnimation from "../components/ScrollPigAnimation";
import { LEVELS } from "../utils/pigWeight";
import NeuBox from "../components/NeuBox";
import { useAppLock } from "../context/AppLockContext";
import { C, T } from "../utils/theme";
import { successTap, heavyTap } from "../utils/haptics";

const { width: SCREEN_W } = Dimensions.get("window");

export default function LevelUpScreen({ navigation, route }) {
  const { fromLevel, toLevel, xp, skins: crossedSkins } = route.params || {};
  const skins = crossedSkins || (toLevel?.skin ? [toLevel.skin] : []);
  const { state } = useAppLock();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scaleIn = useRef(new Animated.Value(0.8)).current;
  // Intro: the pig vacuums coins and grows into its new size, then the card reveals
  const [introDone, setIntroDone] = useState(false);
  const ctaPress = useRef(new Animated.Value(0)).current;
  const ctaScale = ctaPress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });
  const ctaDrop = ctaPress.interpolate({ inputRange: [0, 1], outputRange: [0, 2] });

  useEffect(() => {
    // Fallback in case the animation never reports back
    const t = setTimeout(() => setIntroDone(true), 15000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!introDone) return;
    heavyTap();
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleIn, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [introDone]);

  const handleDone = () => {
    successTap();
    navigation.goBack();
    // Show each skin unlocked by the levels crossed, one after another
    if (skins.length) {
      setTimeout(() => {
        navigation.navigate("SkinUnlock", { skinId: skins[0], queue: skins.slice(1) });
      }, 400);
    }
  };

  return (
    <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        {!introDone && (
          <View style={styles.intro}>
            <ScrollPigAnimation
              fromLevel={fromLevel?.level || 1}
              toLevel={toLevel?.level || 2}
              titles={LEVELS.map((l) => l.tier)}
              onAnimationComplete={() => setTimeout(() => setIntroDone(true), 500)}
            />
          </View>
        )}

        {introDone && <Animated.View
          style={[
            styles.content,
            { opacity: fadeIn, transform: [{ scale: scaleIn }] },
          ]}
        >
          {/* Level label */}
          <Text style={styles.levelBadgeText}>Level {toLevel?.level || "?"}</Text>

          {/* Pig */}
          <View style={styles.pigWrap}>
            <PigIdleWebView
              level={toLevel?.level || 1}
              size={200}
              skin={state.activeSkin || "default"}
            />
          </View>

          {/* Info card */}
          <NeuBox style={styles.card} borderRadius={20} bg="#FFFFFF" borderColor="rgba(255,255,255,0.9)">
            <Text style={styles.tierName}>{toLevel?.tier || "New Tier"}</Text>
            <Text style={styles.xpText}>{xp || 0} XP</Text>
            {fromLevel && (
              <Text style={styles.fromText}>
                Level {fromLevel.level} → Level {toLevel?.level}
              </Text>
            )}
            {skins.length > 0 && (
              <View style={styles.skinUnlockPill}>
                <Text style={styles.skinUnlockText}>
                  {skins.length > 1 ? `${skins.length} new skins unlocked!` : "New skin unlocked!"}
                </Text>
              </View>
            )}
          </NeuBox>

          {/* CTA */}
          <Pressable
            onPressIn={() => Animated.spring(ctaPress, { toValue: 1, tension: 300, friction: 20, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(ctaPress, { toValue: 0, tension: 200, friction: 8, useNativeDriver: true }).start()}
            onPress={handleDone}
          >
            <Animated.View style={[styles.ctaBtn, { transform: [{ scale: ctaScale }, { translateY: ctaDrop }] }]}>
              <View style={styles.ctaFill}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]}
                  locations={[0, 0.45, 1]}
                  style={styles.ctaShine}
                  pointerEvents="none"
                />
                <Text style={styles.ctaBtnText}>
                  {skins.length > 1 ? "See New Skins" : skins.length ? "See New Skin" : "Continue"}
                </Text>
                <Text style={styles.ctaChevron}>›</Text>
              </View>
            </Animated.View>
          </Pressable>
        </Animated.View>}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  intro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  // Matches the "Level N" label on the Stats page
  levelBadgeText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1A1A1A",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  pigWrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    marginBottom: 16,
  },
  card: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 32,
    width: SCREEN_W - 48,
  },
  tierName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2D2D2D",
    letterSpacing: -1,
    marginBottom: 4,
    textShadowColor: "#FFFFFF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  xpText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D2D2D",
    marginBottom: 8,
  },
  fromText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D2D2D",
  },
  skinUnlockPill: {
    backgroundColor: "#FFD6EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 12,
  },
  skinUnlockText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D2D2D",
  },
  // Same look as the Pig Locker button on the Stats page
  ctaBtn: {
    marginTop: 24,
    borderRadius: 18,
    backgroundColor: "#F7A0B2",
    shadowColor: "#E97C95",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaFill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 18,
    paddingLeft: 28,
    paddingRight: 22,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    overflow: "hidden",
  },
  ctaShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "75%",
  },
  ctaBtnText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },
  ctaChevron: { fontSize: 22, fontWeight: "600", color: "#FFFFFF", marginTop: -3 },
});
