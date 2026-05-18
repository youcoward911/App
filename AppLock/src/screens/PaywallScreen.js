import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, T } from "../utils/theme";
import GlowButton from "../components/GlowButton";
import PigMascot from "../components/PigMascot";
import { useAppLock } from "../context/AppLockContext";
import { buySubscription } from "../utils/iap";
import { showAlert } from "../components/CustomAlert";
import { lightTap, successTap } from "../utils/haptics";

const { width: SCREEN_W } = Dimensions.get("window");

const STEPS = [
  {
    icon: "check",
    title: "Day 1:",
    body: "You downloaded an app to stop using other apps. Nice.",
  },
  {
    icon: "lock",
    title: "Today: Pay For Your Sins",
    body: "Lock your worst apps. Every time you cave, you pay. Simple as that.",
  },
  {
    icon: "bell",
    title: "Day 6: The Shame Report",
    body: "We'll send you a full breakdown of how pathetic your week was. You're welcome.",
  },
  {
    icon: "star",
    title: "Day 7: Still Here?",
    body: "Either you've built some discipline or you're completely broke. Win-win.",
  },
];

const FEATURES = [
  { icon: "\u25CE", title: "Peek Mode", body: "Pay less to peek at your apps for 2 minutes. One free peek per day." },
  { icon: "\u2630", title: "Multiple Block Lists", body: "Separate lists for work slop, night slop, weekend slop. All the slop." },
  { icon: "\u29D6", title: "Schedule Locks", body: "Auto-lock your apps in advance so you'll forget and pay me more later." },
  { icon: "\u2193", title: "Weekly Shame Report", body: "Every unlock, every cave, every coin wasted. In writing. Forever." },
];

export default function PaywallScreen({ navigation }) {
  const { dispatch } = useAppLock();
  const [page, setPage] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [buying, setBuying] = useState(false);
  const scrollRef = useRef(null);

  const goNext = () => {
    lightTap();
    if (page < 1) {
      scrollRef.current?.scrollTo({ x: SCREEN_W, animated: true });
      setPage(1);
    }
  };

  const handleSubscribe = async () => {
    setBuying(true);
    try {
      const result = await buySubscription(selectedPlan);
      if (result.success) {
        successTap();
        dispatch({ type: "ACTIVATE_PRO_PIG" });
        showAlert(
          "Welcome, Pro Pig",
          "Your master has granted you privileges. Don't waste them.",
          [{ text: "Oink.", onPress: () => navigation.goBack() }]
        );
      } else if (!result.cancelled) {
        showAlert("Failed", result.error || "Something went wrong.");
      }
    } catch (e) {
      showAlert("Error", "Subscription failed.");
    }
    setBuying(false);
  };

  const onScrollEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setPage(idx);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.restore}>Restore</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeX}>X</Text>
        </TouchableOpacity>
      </View>

      {/* Pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {/* PAGE 1: Features */}
        <ScrollView style={{ width: SCREEN_W }} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>What You Get{"\n"}(Besides Shame)</Text>

          <View style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureBody}>{f.body}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pageBottom}>
            <GlowButton title="Next" onPress={goNext} />
          </View>
        </ScrollView>

        {/* PAGE 3: Pricing */}
        <ScrollView style={{ width: SCREEN_W }} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <PigMascot size={70} mood="clean" />
          <Text style={styles.pageTitle}>Free For 7 Days</Text>
          <Text style={styles.pricingSub}>Then pick your poison. Cancel anytime.</Text>

          {/* Yearly */}
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === "yearly" && styles.planCardSelected]}
            activeOpacity={0.8}
            onPress={() => { lightTap(); setSelectedPlan("yearly"); }}
          >
            {selectedPlan === "yearly" && (
              <View style={styles.saveBadge}><Text style={styles.saveBadgeText}>SAVE 33%</Text></View>
            )}
            <View style={styles.planLeft}>
              <Text style={styles.planName}>Yearly Plan</Text>
              <Text style={styles.planSubPrice}>$39.99/year</Text>
            </View>
            <View style={styles.planRight}>
              <Text style={styles.planPrice}>$3.33/mo</Text>
              <Text style={styles.planTrial}>7 Days Free</Text>
            </View>
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === "monthly" && styles.planCardSelected]}
            activeOpacity={0.8}
            onPress={() => { lightTap(); setSelectedPlan("monthly"); }}
          >
            <View style={styles.planLeft}>
              <Text style={styles.planName}>Monthly Plan</Text>
            </View>
            <View style={styles.planRight}>
              <Text style={styles.planPrice}>$4.99/mo</Text>
              <Text style={styles.planTrial}>7 Days Free</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.pageBottom}>
            {buying ? (
              <ActivityIndicator color={C.pink} size="large" style={{ paddingVertical: 14 }} />
            ) : (
              <GlowButton title="Continue" onPress={handleSubscribe} />
            )}
            <Text style={styles.noPayment}>{"\u2713"} No payment due now. But soon, pig.</Text>
          </View>
        </ScrollView>
      </ScrollView>

      {/* Page dots */}
      <View style={styles.dots}>
        {[0, 1].map((i) => (
          <View key={i} style={[styles.dot, page === i && styles.dotActive]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  restore: { fontSize: 14, fontWeight: "600", color: C.textSecondary },
  closeX: { fontSize: 18, fontWeight: "700", color: C.textSecondary },

  page: {
    paddingHorizontal: 28,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: C.text,
    textAlign: "center",
    letterSpacing: -1,
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 34,
  },
  pageBottom: {
    width: "100%",
    marginTop: 24,
    paddingBottom: 10,
  },

  // Timeline (Page 1)
  timeline: {
    alignSelf: "stretch",
    marginTop: 8,
  },
  timelineRow: {
    flexDirection: "row",
    marginBottom: 0,
  },
  timelineDotCol: {
    width: 40,
    alignItems: "center",
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.pinkPale,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotActive: {
    backgroundColor: C.pink,
  },
  timelineDotText: {
    fontSize: 15,
    fontWeight: "800",
    color: C.pink,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: C.pinkPale,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 14,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.text,
    marginBottom: 4,
  },
  timelineBody: {
    fontSize: 13,
    fontWeight: "400",
    color: C.textSecondary,
    lineHeight: 18,
  },

  // Features (Page 2)
  featuresGrid: {
    alignSelf: "stretch",
    gap: 12,
  },
  featureCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.pinkPale,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  featureIcon: {
    fontSize: 18,
    fontWeight: "900",
    color: C.pink,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.text,
    flex: 1,
  },
  featureBody: {
    fontSize: 12,
    fontWeight: "400",
    color: C.textSecondary,
    lineHeight: 17,
    marginTop: 6,
    width: "100%",
    paddingLeft: 54,
  },

  // Pricing (Page 3)
  pricingSub: {
    fontSize: 14,
    fontWeight: "500",
    color: C.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    marginTop: -8,
  },
  planCard: {
    width: "100%",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  planCardSelected: {
    borderColor: C.pink,
    backgroundColor: "#FFF5F7",
  },
  saveBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: C.pink,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  saveBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  planLeft: {},
  planName: {
    fontSize: 16,
    fontWeight: "800",
    color: C.text,
  },
  planSubPrice: {
    fontSize: 12,
    fontWeight: "500",
    color: C.textSecondary,
    marginTop: 2,
  },
  planRight: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: C.pink,
  },
  planTrial: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textSecondary,
    marginTop: 2,
  },
  noPayment: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textSecondary,
    textAlign: "center",
    marginTop: 10,
  },

  // Dots
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.pinkPale,
  },
  dotActive: {
    backgroundColor: C.pink,
    width: 20,
  },
});
