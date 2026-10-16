import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { heavyTap, successTap } from "../utils/haptics";

const PIG_FLOAT = require("../../assets/pig-float.png");
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// Shard shapes — 8 major shards radiating outward
const SHARDS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return {
    id: i,
    angle,
    dx: Math.cos(angle) * (120 + Math.random() * 80),
    dy: Math.sin(angle) * (120 + Math.random() * 80),
    rotate: (Math.random() - 0.5) * 360,
    size: 20 + Math.random() * 30,
    delay: i * 30,
  };
});

// 6 micro shards
const MICRO_SHARDS = Array.from({ length: 6 }, (_, i) => {
  const angle = (i / 6) * Math.PI * 2 + 0.3;
  return {
    id: i + 8,
    angle,
    dx: Math.cos(angle) * (60 + Math.random() * 40),
    dy: Math.sin(angle) * (60 + Math.random() * 40),
    rotate: (Math.random() - 0.5) * 180,
    size: 8 + Math.random() * 12,
    delay: 50 + i * 40,
  };
});

// 6 confetti sparkles for reveal
const CONFETTI = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  dx: (Math.random() - 0.5) * 200,
  dy: -(80 + Math.random() * 120),
  delay: 150 + i * 100,
}));

export default function GlassBreakAnimation({ visible, fromLevel, toLevel, onComplete }) {
  const [phase, setPhase] = useState(0); // 0=idle, 1=frost, 2=shatter, 3=reveal

  // Phase 1: Frost
  const frostOpacity = useRef(new Animated.Value(0)).current;
  const frostBlur = useRef(new Animated.Value(0)).current;
  const crackOpacity = useRef(new Animated.Value(0)).current;

  // Phase 2: Shatter
  const shardAnims = useRef(SHARDS.map(() => ({
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
    rotate: new Animated.Value(0),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(1),
  }))).current;
  const microShardAnims = useRef(MICRO_SHARDS.map(() => ({
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(1),
  }))).current;
  const ringScale = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const ringOpacity = useRef([
    new Animated.Value(0.6),
    new Animated.Value(0.6),
    new Animated.Value(0.6),
  ]).current;

  // Phase 3: Reveal
  const pigScale = useRef(new Animated.Value(0.5)).current;
  const pigTranslateY = useRef(new Animated.Value(-20)).current;
  const pigOpacity = useRef(new Animated.Value(0)).current;
  const burstScale = useRef(new Animated.Value(0.3)).current;
  const burstOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeRotate = useRef(new Animated.Value(-20)).current;
  const confettiAnims = useRef(CONFETTI.map(() => ({
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0.3),
  }))).current;
  const shineX = useRef(new Animated.Value(-100)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;

  // Caption text
  const frostText = useRef(new Animated.Value(0)).current;
  const shatterText = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setPhase(0);
      return;
    }
    runSequence();
  }, [visible]);

  const resetAll = () => {
    frostOpacity.setValue(0);
    crackOpacity.setValue(0);
    frostText.setValue(0);
    shatterText.setValue(0);
    shardAnims.forEach((a) => {
      a.translateX.setValue(0); a.translateY.setValue(0);
      a.rotate.setValue(0); a.opacity.setValue(1); a.scale.setValue(1);
    });
    microShardAnims.forEach((a) => {
      a.translateX.setValue(0); a.translateY.setValue(0);
      a.opacity.setValue(1); a.scale.setValue(1);
    });
    ringScale.forEach((r) => r.setValue(0));
    ringOpacity.forEach((r) => r.setValue(0.6));
    pigScale.setValue(0.5); pigTranslateY.setValue(-20); pigOpacity.setValue(0);
    burstScale.setValue(0.3); burstOpacity.setValue(0);
    badgeScale.setValue(0); badgeRotate.setValue(-20);
    confettiAnims.forEach((a) => {
      a.translateX.setValue(0); a.translateY.setValue(0);
      a.opacity.setValue(0); a.scale.setValue(0.3);
    });
    shineX.setValue(-100);
    labelOpacity.setValue(0);
  };

  const runSequence = () => {
    resetAll();

    // PHASE 1: Frost (0-2s)
    setPhase(1);
    Animated.parallel([
      Animated.timing(frostOpacity, { toValue: 0.82, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(crackOpacity, { toValue: 0.9, duration: 800, delay: 800, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(frostText, { toValue: 1, duration: 600, delay: 400, useNativeDriver: true }),
    ]).start(() => {
      heavyTap();

      // PHASE 2: Shatter (2-3.5s)
      setPhase(2);
      Animated.timing(frostOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      Animated.timing(crackOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      Animated.timing(frostText, { toValue: 0, duration: 100, useNativeDriver: true }).start();
      Animated.timing(shatterText, { toValue: 1, duration: 300, delay: 100, useNativeDriver: true }).start();

      // Shards fly out
      const shardAnimations = SHARDS.map((s, i) =>
        Animated.parallel([
          Animated.timing(shardAnims[i].translateX, { toValue: s.dx, duration: 600, delay: s.delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(shardAnims[i].translateY, { toValue: s.dy, duration: 600, delay: s.delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(shardAnims[i].rotate, { toValue: s.rotate, duration: 600, delay: s.delay, useNativeDriver: true }),
          Animated.timing(shardAnims[i].opacity, { toValue: 0, duration: 400, delay: s.delay + 300, useNativeDriver: true }),
          Animated.timing(shardAnims[i].scale, { toValue: 0.3, duration: 600, delay: s.delay, useNativeDriver: true }),
        ])
      );

      // Micro shards
      const microAnimations = MICRO_SHARDS.map((s, i) =>
        Animated.parallel([
          Animated.timing(microShardAnims[i].translateX, { toValue: s.dx, duration: 500, delay: s.delay, useNativeDriver: true }),
          Animated.timing(microShardAnims[i].translateY, { toValue: s.dy, duration: 500, delay: s.delay, useNativeDriver: true }),
          Animated.timing(microShardAnims[i].opacity, { toValue: 0, duration: 300, delay: s.delay + 200, useNativeDriver: true }),
          Animated.timing(microShardAnims[i].scale, { toValue: 0, duration: 500, delay: s.delay, useNativeDriver: true }),
        ])
      );

      // Impact rings
      const ringAnimations = ringScale.map((r, i) =>
        Animated.parallel([
          Animated.timing(r, { toValue: 3, duration: 500, delay: i * 150, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(ringOpacity[i], { toValue: 0, duration: 500, delay: i * 150, useNativeDriver: true }),
        ])
      );

      Animated.parallel([...shardAnimations, ...microAnimations, ...ringAnimations]).start(() => {
        successTap();

        // PHASE 3: Reveal (3.5-5.5s)
        setPhase(3);
        Animated.timing(shatterText, { toValue: 0, duration: 100, useNativeDriver: true }).start();

        // Pig bounces in
        Animated.parallel([
          Animated.spring(pigScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
          Animated.spring(pigTranslateY, { toValue: 0, friction: 5, tension: 50, useNativeDriver: true }),
          Animated.timing(pigOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();

        // Burst
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.timing(burstScale, { toValue: 1.4, duration: 400, useNativeDriver: true }),
            Animated.timing(burstOpacity, { toValue: 0.6, duration: 200, useNativeDriver: true }),
          ]),
          Animated.timing(burstOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();

        // Badge pops in
        Animated.sequence([
          Animated.delay(600),
          Animated.spring(badgeScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
          Animated.timing(badgeRotate, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();

        // Confetti
        CONFETTI.forEach((c, i) => {
          Animated.sequence([
            Animated.delay(c.delay),
            Animated.parallel([
              Animated.timing(confettiAnims[i].opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
              Animated.timing(confettiAnims[i].scale, { toValue: 1, duration: 300, useNativeDriver: true }),
              Animated.timing(confettiAnims[i].translateX, { toValue: c.dx, duration: 600, useNativeDriver: true }),
              Animated.timing(confettiAnims[i].translateY, { toValue: c.dy, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            ]),
            Animated.timing(confettiAnims[i].opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]).start();
        });

        // Badge shine sweep
        Animated.loop(
          Animated.timing(shineX, { toValue: 100, duration: 2000, delay: 800, useNativeDriver: true })
        ).start();

        // Level label
        Animated.timing(labelOpacity, { toValue: 1, duration: 400, delay: 800, useNativeDriver: true }).start();

        // Auto-complete after reveal
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 3000);
      });
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        {/* Dark overlay */}
        <View style={styles.overlay} />

        {/* Phase 1: Frost overlay + cracks */}
        {phase >= 1 && (
          <>
            <Animated.View style={[styles.frost, { opacity: frostOpacity }]} />
            <Animated.View style={[styles.cracksContainer, { opacity: crackOpacity }]}>
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * 360;
                return (
                  <View
                    key={i}
                    style={[styles.crackLine, { transform: [{ rotate: `${angle}deg` }] }]}
                  />
                );
              })}
            </Animated.View>
            <Animated.View style={[styles.captionWrap, { opacity: frostText }]}>
              <Text style={styles.captionText}>Glass is freezing over...</Text>
            </Animated.View>
          </>
        )}

        {/* Phase 2: Shards flying out + impact rings */}
        {phase >= 2 && (
          <>
            {/* Impact rings */}
            {ringScale.map((r, i) => (
              <Animated.View
                key={`ring-${i}`}
                style={[styles.impactRing, {
                  transform: [{ scale: r }],
                  opacity: ringOpacity[i],
                }]}
              />
            ))}

            {/* Major shards */}
            {SHARDS.map((s, i) => (
              <Animated.View
                key={s.id}
                style={[styles.shard, {
                  width: s.size,
                  height: s.size * 0.7,
                  transform: [
                    { translateX: shardAnims[i].translateX },
                    { translateY: shardAnims[i].translateY },
                    { rotate: shardAnims[i].rotate.interpolate({ inputRange: [-360, 360], outputRange: ["-360deg", "360deg"] }) },
                    { scale: shardAnims[i].scale },
                  ],
                  opacity: shardAnims[i].opacity,
                }]}
              />
            ))}

            {/* Micro shards */}
            {MICRO_SHARDS.map((s, i) => (
              <Animated.View
                key={s.id}
                style={[styles.microShard, {
                  width: s.size,
                  height: s.size,
                  transform: [
                    { translateX: microShardAnims[i].translateX },
                    { translateY: microShardAnims[i].translateY },
                    { scale: microShardAnims[i].scale },
                  ],
                  opacity: microShardAnims[i].opacity,
                }]}
              />
            ))}

            <Animated.View style={[styles.captionWrap, { opacity: shatterText }]}>
              <Text style={styles.captionText}>✦ SHATTERING! ✦</Text>
            </Animated.View>
          </>
        )}

        {/* Phase 3: New pig reveal */}
        {phase >= 3 && (
          <>
            {/* Burst */}
            <Animated.View style={[styles.burst, {
              transform: [{ scale: burstScale }],
              opacity: burstOpacity,
            }]} />

            {/* Confetti */}
            {CONFETTI.map((c, i) => (
              <Animated.View
                key={`conf-${c.id}`}
                style={[styles.confetti, {
                  transform: [
                    { translateX: confettiAnims[i].translateX },
                    { translateY: confettiAnims[i].translateY },
                    { scale: confettiAnims[i].scale },
                  ],
                  opacity: confettiAnims[i].opacity,
                }]}
              >
                <Text style={styles.confettiStar}>✦</Text>
              </Animated.View>
            ))}

            {/* New pig */}
            <Animated.View style={[styles.pigWrap, {
              transform: [{ scale: pigScale }, { translateY: pigTranslateY }],
              opacity: pigOpacity,
            }]}>
              <Image source={PIG_FLOAT} style={styles.pigImg} resizeMode="contain" />
            </Animated.View>

            {/* Level badge */}
            <Animated.View style={[styles.badge, {
              transform: [
                { scale: badgeScale },
                { rotate: badgeRotate.interpolate({ inputRange: [-20, 0], outputRange: ["-20deg", "0deg"] }) },
              ],
            }]}>
              <LinearGradient colors={["#2D2D2D", "#FF8AC6"]} style={styles.badgeGrad}>
                <Text style={styles.badgeText}>✦ LEVEL {toLevel?.level || "?"} ✦</Text>
              </LinearGradient>
            </Animated.View>

            {/* Level unlocked label */}
            <Animated.View style={[styles.labelWrap, { opacity: labelOpacity }]}>
              <Text style={styles.labelTitle}>LEVEL {toLevel?.level} UNLOCKED!</Text>
              <Text style={styles.labelTier}>{toLevel?.tier}</Text>
            </Animated.View>
          </>
        )}
      </View>
    </Modal>
  );
}

const CENTER_X = SCREEN_W / 2;
const CENTER_Y = SCREEN_H / 2 - 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20,5,15,0.85)",
  },

  // Phase 1: Frost
  frost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,220,235,0.82)",
  },
  cracksContainer: {
    position: "absolute",
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  crackLine: {
    position: "absolute",
    width: 2,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 1,
  },

  // Phase 2: Shards
  shard: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 3,
  },
  microShard: {
    position: "absolute",
    backgroundColor: "rgba(255,200,220,0.6)",
    borderRadius: 2,
  },
  impactRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },

  // Phase 3: Reveal
  burst: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,105,180,0.3)",
  },
  pigWrap: {
    position: "absolute",
  },
  pigImg: {
    width: 200,
    height: 200,
  },
  badge: {
    position: "absolute",
    top: CENTER_Y - 130,
  },
  badgeGrad: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  confetti: {
    position: "absolute",
  },
  confettiStar: {
    fontSize: 20,
    color: "#2D2D2D",
  },
  labelWrap: {
    position: "absolute",
    top: CENTER_Y + 110,
    alignItems: "center",
  },
  labelTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
    textShadowColor: "rgba(255,105,180,0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  labelTier: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF8AC6",
    marginTop: 4,
  },

  // Captions
  captionWrap: {
    position: "absolute",
    bottom: SCREEN_H * 0.25,
    alignItems: "center",
  },
  captionText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2D2D2D",
    letterSpacing: 1,
    textShadowColor: "rgba(255,105,180,0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
