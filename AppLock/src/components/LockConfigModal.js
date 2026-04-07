import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { C, T, NEU_RAISED, NEU_INSET } from "../utils/theme";
import { DURATION_PRESETS, FEE_TIERS } from "../context/AppLockContext";
import GlowButton from "./GlowButton";

const CUSTOM_MINUTES = [];
for (let m = 15; m <= 480; m += 15) {
  const h = Math.floor(m / 60);
  const r = m % 60;
  let label;
  if (h === 0) label = `${m} min`;
  else if (r === 0) label = h === 1 ? "1 hour" : `${h} hours`;
  else label = `${h}h ${r}m`;
  CUSTOM_MINUTES.push({ label, minutes: m });
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export default function LockConfigModal({ visible, onClose, onConfirm, appName }) {
  const [durationIdx, setDurationIdx] = useState(0); // index into DURATION_PRESETS
  const [feeIdx, setFeeIdx] = useState(0);
  const [showCustom, setShowCustom] = useState(false);
  const [customIdx, setCustomIdx] = useState(0);
  const scrollRef = useRef(null);

  const handlePreset = (idx) => {
    setShowCustom(false);
    setDurationIdx(idx);
  };

  const handleCustom = () => {
    setShowCustom(true);
  };

  const handleConfirm = () => {
    const dur = showCustom ? CUSTOM_MINUTES[customIdx].minutes : DURATION_PRESETS[durationIdx].minutes;
    const tier = FEE_TIERS[feeIdx];
    onConfirm({ durationMinutes: dur, peekFee: tier.peek, fullFee: tier.full });
  };

  const onScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_HEIGHT);
    setCustomIdx(Math.max(0, Math.min(idx, CUSTOM_MINUTES.length - 1)));
  };

  const selectedDuration = showCustom
    ? CUSTOM_MINUTES[customIdx].label
    : DURATION_PRESETS[durationIdx].label;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
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
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                }}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
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

          {/* Fee Section */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>UNLOCK FEES</Text>
          <Text style={styles.feeExplain}>Peek (1 min) / Full unlock</Text>
          <View style={styles.presetRow}>
            {FEE_TIERS.map((t, i) => (
              <TouchableOpacity
                key={t.label}
                style={[styles.chip, feeIdx === i && styles.chipActive]}
                onPress={() => setFeeIdx(i)}
              >
                <Text style={[styles.chipText, feeIdx === i && styles.chipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.feeSummary}>
            <Text style={styles.feeSummaryText}>
              Peek: {FEE_TIERS[feeIdx].peek} coin{FEE_TIERS[feeIdx].peek > 1 ? "s" : ""} for 1 min
            </Text>
            <Text style={styles.feeSummaryText}>
              Full unlock: {FEE_TIERS[feeIdx].full} coins (permanent)
            </Text>
            <Text style={styles.feeSummaryHint}>Peek cost doubles each time</Text>
          </View>

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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: "flex-end",
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
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.pinkPale,
    alignSelf: "center",
    marginBottom: 16,
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
    backgroundColor: "rgba(255,105,180,0.08)",
    borderRadius: 12,
    zIndex: 1,
    pointerEvents: "none",
  },
  feeExplain: {
    ...T.caption,
    marginBottom: 10,
    fontStyle: "italic",
  },
  feeSummary: {
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.white,
    ...NEU_RAISED,
  },
  feeSummaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  feeSummaryHint: {
    ...T.caption,
    fontStyle: "italic",
    marginTop: 4,
    color: C.pink,
  },
  selectedTimeWrap: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,105,180,0.08)",
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
