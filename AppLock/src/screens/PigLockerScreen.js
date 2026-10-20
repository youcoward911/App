import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import PigIdleWebView from "../components/PigIdleWebView";
import { PIG_SKINS, RARITY_COLORS } from "../data/pigSkins";
import { useAppLock } from "../context/AppLockContext";
import { getLevel } from "../utils/pigWeight";
import { lightTap, successTap } from "../utils/haptics";
import CloseButton from "../components/CloseButton";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W;

export default function PigLockerScreen({ navigation }) {
  const { state, dispatch } = useAppLock();
  const realLevel = getLevel(state.totalCoinsSpent).level;
  const userLevel = realLevel;
  const [activeIndex, setActiveIndex] = useState(0);
  const slideUp = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.spring(slideUp, {
      toValue: 0,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClose = () => {
    lightTap();
    navigation.goBack();
  };

  const handleSelect = (skinId) => {
    successTap();
    dispatch({ type: "SET_SKIN", payload: skinId });
  };

  const handleUnbox = (skin) => {
    lightTap();
    navigation.navigate("SkinUnlock", { skinId: skin.id });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const renderSkin = ({ item: skin }) => {
    const unlocked = userLevel >= skin.unlockLevel;
    const isActive = state.activeSkin === skin.id;
    const rc = RARITY_COLORS[skin.rarity];

    return (
      <View style={styles.card}>
        <View style={styles.pigArea}>
          <View style={[styles.pigCenter, !unlocked && styles.pigBlurred]}>
            <PigIdleWebView level={userLevel} size={224} skin={skin.id} silent={!unlocked} />
          </View>
          {!unlocked && (
            <View style={styles.lockOverlay}>
              <View style={styles.lockIcon}>
                <View style={styles.lockShackle} />
                <View style={styles.lockBody} />
              </View>
            </View>
          )}
        </View>

        <Text style={styles.skinName}>{skin.name}</Text>
        <View style={[styles.rarityPill, { borderWidth: 1.5, borderColor: rc.bg === "rgba(255,255,255,.4)" ? "#F7A0B2" : rc.bg }]}>
          <Text style={[styles.rarityText, { color: rc.bg === "rgba(255,255,255,.4)" ? "#2D2D2D" : rc.bg }]}>
            {skin.rarityLabel}
          </Text>
        </View>
        <Text style={styles.skinDesc}>{skin.description}</Text>

        {unlocked ? (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.selectBtn, isActive && styles.selectBtnActive]}
              activeOpacity={0.7}
              onPress={() => handleSelect(skin.id)}
            >
              <Text style={[styles.selectBtnText, isActive && styles.selectBtnTextActive]}>
                {isActive ? "Equipped" : "Equip"}
              </Text>
            </TouchableOpacity>
            {skin.id !== "default" && (
              <TouchableOpacity style={styles.unboxBtn} activeOpacity={0.7} onPress={() => handleUnbox(skin)}>
                <Text style={styles.unboxBtnText}>Preview</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.lockedBtnRow}>
            <Text style={styles.lockedText}>Reach Level {skin.unlockLevel} to unlock</Text>
            <Text style={styles.lockedSub}>You're Lv.{realLevel}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.topBar, { transform: [{ translateY: slideUp }] }]}>
          <CloseButton onPress={handleClose} />
          <Text style={styles.title}>Pig Locker</Text>
          <View style={styles.levelLabel}>
            <Text style={styles.levelLabelText}>Lv.{realLevel}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.carouselWrap, { transform: [{ translateY: slideUp }] }]}>
          <Animated.FlatList
            data={PIG_SKINS}
            keyExtractor={(s) => s.id}
            renderItem={renderSkin}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            getItemLayout={(_, i) => ({ length: CARD_W, offset: CARD_W * i, index: i })}
          />
        </Animated.View>

        <View style={styles.dots}>
          {PIG_SKINS.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  closeText: { fontSize: 16, fontWeight: "700", color: "#2D2D2D" },
  title: { fontSize: 18, fontWeight: "900", color: "#2D2D2D", letterSpacing: 1 },
  levelLabel: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  levelLabelText: { fontSize: 11, fontWeight: "800", color: "#2D2D2D" },

  carouselWrap: { flex: 1, justifyContent: "center" },

  card: {
    width: CARD_W,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  pigArea: {
    width: CARD_W,
    height: 236,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible", // the pig WebView extends 80pt past its box for the speech bubble/bounce
  },
  pigCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  pigBlurred: {
    opacity: 0.35,
  },
  lockOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  lockIcon: {
    alignItems: "center",
  },
  lockShackle: {
    width: 28,
    height: 20,
    borderWidth: 3.5,
    borderColor: "#2D2D2D",
    borderBottomWidth: 0,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    marginBottom: -2,
  },
  lockBody: {
    width: 36,
    height: 26,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: "#2D2D2D",
  },

  skinName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2D2D2D",
    marginTop: 0,
  },
  rarityPill: {
    paddingHorizontal: 14, paddingVertical: 4, borderRadius: 10, marginTop: 6,
  },
  rarityText: {
    fontSize: 10, fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase",
  },
  skinDesc: {
    fontSize: 14, fontWeight: "500", color: "#2D2D2D",
    textAlign: "center", marginTop: 8, paddingHorizontal: 16, lineHeight: 19,
  },

  btnRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  selectBtn: {
    borderWidth: 1.5,
    borderColor: "#F7A0B2",
    borderRadius: 16, paddingVertical: 12, paddingHorizontal: 28,
  },
  selectBtnActive: { borderColor: "#2D2D2D" },
  selectBtnText: { fontSize: 15, fontWeight: "800", color: "#2D2D2D", letterSpacing: 0.5 },
  selectBtnTextActive: { color: "#2D2D2D" },
  unboxBtn: {
    borderWidth: 1,
    borderColor: "#F7A0B2",
    borderRadius: 16, paddingVertical: 12, paddingHorizontal: 20,
  },
  unboxBtnText: { fontSize: 13, fontWeight: "700", color: "#2D2D2D" },

  lockedBtnRow: { alignItems: "center", marginTop: 14 },
  lockedText: { fontSize: 14, fontWeight: "700", color: "#F7A0B2" },
  lockedSub: { fontSize: 12, fontWeight: "500", color: "#F7A0B2", marginTop: 4 },

  dots: {
    flexDirection: "row", justifyContent: "center", gap: 6,
    paddingBottom: 16,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  dotActive: {
    borderWidth: 1.5,
    borderColor: "#2D2D2D",
    backgroundColor: "transparent",
    width: 18,
  },
});
