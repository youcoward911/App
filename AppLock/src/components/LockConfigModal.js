import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  PanResponder,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { C, T, NEU_RAISED, NEU_INSET } from "../utils/theme";
import { DURATION_PRESETS } from "../context/AppLockContext";
import GlowButton from "./GlowButton";
import { lightTap, mediumTap } from "../utils/haptics";

const SCREEN_H = Dimensions.get("window").height;

const CUSTOM_MINUTES = [];
function addMinute(m) {
  const h = Math.floor(m / 60);
  const r = m % 60;
  let label;
  if (h === 0) label = `${m} min`;
  else if (r === 0) label = h === 1 ? "1 hour" : `${h} hours`;
  else label = `${h}h ${r}m`;
  CUSTOM_MINUTES.push({ label, minutes: m });
}
// 60-240 min (1-4 hrs): 15 min intervals
for (let m = 60; m <= 240; m += 15) addMinute(m);
// 270-600 min (4.5-10 hrs): 30 min intervals
for (let m = 270; m <= 600; m += 30) addMinute(m);
// 660-1440 min (11-24 hrs): 60 min intervals
for (let m = 660; m <= 1440; m += 60) addMinute(m);

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export default function LockConfigModal({ visible, onClose, onConfirm, appName }) {
  const [durationIdx, setDurationIdx] = useState(0);
  const [showCustom, setShowCustom] = useState(false);
  const [customIdx, setCustomIdx] = useState(0);
  const lastNotchRef = useRef(0);
  const swipeY = useRef(new Animated.Value(0)).current;

  const handlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) swipeY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) {
          onClose();
        } else {
          Animated.spring(swipeY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }).start();
        }
      },
    })
  ).current;
  const scrollRef = useRef(null);

  const handlePreset = (idx) => {
    lightTap();
    setShowCustom(false);
    setDurationIdx(idx);
  };

  const handleCustom = () => {
    lightTap();
    setShowCustom(true);
  };

  const handleConfirm = () => {
    const dur = showCustom ? CUSTOM_MINUTES[customIdx].minutes : DURATION_PRESETS[durationIdx].minutes;
    onConfirm({ durationMinutes: dur });
  };

  const onWheelScroll = useCallback((e) => {
    const y = e.nativeEvent.contentOffset.y;
    const notch = Math.round(y / ITEM_HEIGHT);
    if (notch !== lastNotchRef.current && notch >= 0 && notch < CUSTOM_MINUTES.length) {
      lastNotchRef.current = notch;
      mediumTap();
    }
  }, []);

  const onScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_HEIGHT);
    const newIdx = Math.max(0, Math.min(idx, CUSTOM_MINUTES.length - 1));
    setCustomIdx(newIdx);
  };

  const selectedDuration = showCustom
    ? CUSTOM_MINUTES[customIdx].label
    : DURATION_PRESETS[durationIdx].label;

  // Backdrop fades in place while the sheet slides up (and the reverse on close)
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(SCREEN_H)).current;
  const [mounted, setMounted] = useState(visible);
  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      overlayOpacity.setValue(0);
      sheetY.setValue(SCREEN_H);
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(sheetY, { toValue: 0, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(sheetY, { toValue: SCREEN_H, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(() => {
        setMounted(false);
        swipeY.setValue(0);
      });
    }
  }, [visible]);

  return (
    <Modal visible={mounted} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: overlayOpacity }]} />
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: Animated.add(sheetY, swipeY) }] }]}>
          <View {...handlePanResponder.panHandlers} style={styles.handleZone}>
            <View style={styles.handle} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false} nestedScrollEnabled={true}>
          <Text style={styles.title}>Lock {appName}</Text>

          {/* Duration Section */}
          <Text style={styles.sectionLabel}>HOW LONG?</Text>
          <View style={styles.presetRow}>
            {DURATION_PRESETS.map((p, i) => (
              <TouchableOpacity
                key={p.minutes}
                style={[styles.chip, !showCustom && durationIdx === i && styles.chipActive]}
                onPress={() => handlePreset(i)}
              >
                <Text style={[styles.chipText, !showCustom && durationIdx === i && styles.chipTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.chip, showCustom && styles.chipActive]}
              onPress={handleCustom}
            >
              <Text style={[styles.chipText, showCustom && styles.chipTextActive]}>Custom</Text>
            </TouchableOpacity>
          </View>

          {/* Custom scroll wheel */}
          {showCustom && (
            <View style={styles.wheelWrap}>
              <View style={styles.wheelHighlight} />
              <ScrollView
                ref={scrollRef}
                style={styles.wheel}
                nestedScrollEnabled={true}
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                }}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                onScroll={onWheelScroll}
                scrollEventThrottle={16}
                onMomentumScrollEnd={onScrollEnd}
                onScrollEndDrag={onScrollEnd}
              >
                {CUSTOM_MINUTES.map((item, i) => (
                  <View key={item.minutes} style={styles.wheelItem}>
                    <Text style={[styles.wheelText, i === customIdx && styles.wheelTextActive]}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Selected time callout */}
          {showCustom && (
            <View style={styles.selectedTimeWrap}>
              <Text style={styles.selectedTimeLabel}>SELECTED:</Text>
              <Text style={styles.selectedTimeValue}>{CUSTOM_MINUTES[customIdx].label}</Text>
            </View>
          )}

          {/* Confirm */}
          <View style={styles.buttons}>
            <GlowButton
              title={`Lock for ${selectedDuration}`}
              onPress={handleConfirm}
            />
            <GlowButton title="Nevermind" ghost onPress={onClose} />
          </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: C.overlay,
  },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    paddingTop: 12,
    maxHeight: "85%",
  },
  handleZone: {
    paddingTop: 14,
    paddingBottom: 16,
    alignItems: "center",
    width: "100%",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.pinkPale,
  },
  title: {
    ...T.h2,
    textAlign: "center",
    marginBottom: 20,
  },
  sectionLabel: {
    ...T.label,
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: C.white,
    ...NEU_RAISED,
  },
  chipActive: {
    backgroundColor: C.pink,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  chipTextActive: {
    color: C.textOnPink,
  },
  wheelWrap: {
    height: WHEEL_HEIGHT,
    marginTop: 12,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: C.white,
    ...NEU_INSET,
  },
  wheel: {
    height: WHEEL_HEIGHT,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelText: {
    fontSize: 18,
    fontWeight: "600",
    color: C.textTertiary,
    letterSpacing: 0.5,
  },
  wheelTextActive: {
    color: C.pink,
    fontWeight: "900",
    fontSize: 20,
  },
  wheelHighlight: {
    position: "absolute",
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: "rgba(247,160,178,0.08)",
    borderRadius: 12,
    zIndex: 1,
    pointerEvents: "none",
  },
  feeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.pinkPale,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.pink,
    marginTop: -1,
  },
  selectedTimeWrap: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(247,160,178,0.08)",
  },
  selectedTimeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.textTertiary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  selectedTimeValue: {
    fontSize: 22,
    fontWeight: "900",
    color: C.pink,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  buttons: {
    marginTop: 20,
  },
});
