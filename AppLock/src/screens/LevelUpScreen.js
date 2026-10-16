import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import PigIdleWebView from "../components/PigIdleWebView";
import GlassBreakAnimation from "../components/GlassBreakAnimation";
import NeuBox from "../components/NeuBox";
import { useAppLock } from "../context/AppLockContext";
import { C, T, NEON_GLOW } from "../utils/theme";
import { successTap, heavyTap } from "../utils/haptics";

const { width: SCREEN_W } = Dimensions.get("window");

export default function LevelUpScreen({ navigation, route }) {
  const { fromLevel, toLevel, xp } = route.params || {};
  const { state } = useAppLock();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scaleIn = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
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
  }, []);

  const handleDone = () => {
    successTap();
    navigation.goBack();
    // Navigate to skin unlock if this level grants one
    if (toLevel?.skin) {
      setTimeout(() => {
        navigation.navigate("SkinUnlock", { skinId: toLevel.skin });
      }, 400);
    }
  };

  return (
    <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <GlassBreakAnimation />

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeIn, transform: [{ scale: scaleIn }] },
          ]}
        >
          {/* Level badge */}
          <LinearGradient
            colors={["#2D2D2D", "#FF8AC6"]}
            style={styles.levelBadge}
          >
            <Text style={styles.levelBadgeText}>
              LEVEL {toLevel?.level || "?"}
            </Text>
          </LinearGradient>

          {/* Pig */}
          <View style={styles.pigWrap}>
            <PigIdleWebView
              level={Math.min(toLevel?.level || 1, 5)}
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
            {toLevel?.skin && (
              <View style={styles.skinUnlockPill}>
                <Text style={styles.skinUnlockText}>
                  New skin unlocked!
                </Text>
              </View>
            )}
          </NeuBox>

          {/* CTA */}
          <TouchableOpacity
            style={styles.ctaBtn}
            activeOpacity={0.7}
            onPress={handleDone}
          >
            <LinearGradient
              colors={["#2D2D2D", "#FF8AC6"]}
              style={styles.ctaGrad}
            >
              <Text style={styles.ctaBtnText}>
                {toLevel?.skin ? "See New Skin" : "Continue"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  levelBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  levelBadgeText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
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
  ctaBtn: {
    marginTop: 24,
    width: SCREEN_W - 80,
    borderRadius: 20,
    overflow: "hidden",
    ...NEON_GLOW,
  },
  ctaGrad: {
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
