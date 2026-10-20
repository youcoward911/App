import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import PigIdleWebView from "../components/PigIdleWebView";
import PinkButton from "../components/PinkButton";
import CloseButton from "../components/CloseButton";
import ScrollPigLogo from "../components/ScrollPigLogo";
import ShameReportPreview from "../components/ShameReportPreview";
import { useAppLock } from "../context/AppLockContext";
import { buySubscription, restorePurchases } from "../utils/iap";
import { showAlert } from "../components/CustomAlert";
import { lightTap, successTap } from "../utils/haptics";

const { width: SCREEN_W } = Dimensions.get("window");
const PINK = "#F7A0B2";
const TERMS_URL = "https://raw.githubusercontent.com/youcoward911/App/main/TERMS_OF_USE.md";
const PRIVACY_URL = "https://raw.githubusercontent.com/youcoward911/App/main/PRIVACY_POLICY.md";
const INK = "#2D2D2D";
const OUTLINE = { textShadowColor: "#FFFFFF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 2 };

const FEATURES = [
  { icon: "eye", title: "Peek Mode", body: "Sneak a 2-minute look instead of a full surrender. Your first peek every lock is free." },
  { icon: "albums", title: "Multiple Slop Lists", body: "Work slop, night slop, weekend slop. Lock each on its own." },
  { icon: "calendar", title: "Auto-Schedule", body: "Locks that start on their own, so you can't talk yourself out of it." },
  { icon: "document-text", title: "Weekly Shame Report", body: "Every Sunday: every cave, every coin, your weakest day and hour. In writing." },
];

const PLANS = [
  { id: "yearly", name: "Yearly", price: "$3.33", per: "/mo", sub: "$39.99 billed yearly", badge: "SAVE 33%" },
  { id: "monthly", name: "Monthly", price: "$4.99", per: "/mo", sub: "Billed monthly" },
];

export default function PaywallScreen({ navigation }) {
  const { dispatch } = useAppLock();
  const [page, setPage] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [buying, setBuying] = useState(false);
  const scrollRef = useRef(null);

  const goTo = (idx) => {
    lightTap();
    scrollRef.current?.scrollTo({ x: SCREEN_W * idx, animated: true });
    setPage(idx);
  };

  const welcome = (devNote) => {
    successTap();
    dispatch({ type: "ACTIVATE_PRO_PIG" });
    showAlert(
      "Welcome, Pro Pig",
      "Your master has granted you privileges. Don't waste them." + (devNote ? "\n\n(Dev mode — no charge)" : ""),
      [{ text: "Oink.", onPress: () => navigation.goBack() }]
    );
  };

  const handleSubscribe = async () => {
    setBuying(true);
    try {
      const result = await buySubscription(selectedPlan);
      if (result.success) welcome(false);
      else if (result.cancelled) {
        // Closed the App Store sheet: nothing to say
      } else if (__DEV__) welcome(true); // no store in development builds: fake it
      else showAlert("Purchase Failed", result.error || "The App Store didn't go through. You weren't charged. Try again.");
    } catch (e) {
      if (__DEV__) welcome(true);
      else showAlert("Purchase Failed", "The App Store didn't go through. You weren't charged. Try again.");
    }
    setBuying(false);
  };

  const handleRestore = async () => {
    lightTap();
    const result = await restorePurchases().catch(() => ({ success: false }));
    if (result.success && result.hasPro) {
      welcome(false);
    } else if (result.success) {
      showAlert("Nothing to Restore", "No Pro subscription found on this Apple ID.");
    } else {
      showAlert("Couldn't Restore", "The App Store didn't answer. Check your connection and try again.");
    }
  };

  const onScrollEnd = (e) => setPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W));

  return (
    <LinearGradient colors={["#EDE8E4", "#F5CCD5"]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn} activeOpacity={0.6} hitSlop={8}>
            <Text style={styles.restore}>Restore</Text>
          </TouchableOpacity>
          <View style={styles.dots}>
            {[0, 1].map((i) => <View key={i} style={[styles.dot, page === i && styles.dotActive]} />)}
          </View>
          <CloseButton onPress={() => navigation.goBack()} style={styles.closeBtn} />
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          style={{ flex: 1 }}
        >
          {/* PAGE 1: What you get */}
          <ScrollView style={{ width: SCREEN_W }} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
            <View style={styles.brandRow}>
              <ScrollPigLogo height={40} />
              <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>
            </View>
            <Text style={styles.pageTitle}>What you get{"\n"}(besides shame)</Text>

            <View style={styles.features}>
              {FEATURES.map((f) => (
                <View key={f.title} style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={f.icon} size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureBody}>{f.body}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.previewLabel}>A peek at your Sunday shame</Text>
            <ShameReportPreview />

            <PinkButton title="See Plans" onPress={() => goTo(1)} style={styles.cta} />
          </ScrollView>

          {/* PAGE 2: Plans */}
          <ScrollView style={{ width: SCREEN_W }} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
            <PigIdleWebView size={160} />
            <Text style={[styles.pageTitle, { marginTop: 4 }]}>Free for 7 days</Text>
            <Text style={styles.pricingSub}>Then pick your poison. Cancel anytime.</Text>

            <View style={styles.plans}>
              {PLANS.map((p) => {
                const on = selectedPlan === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => { lightTap(); setSelectedPlan(p.id); }}
                    style={[styles.planCard, on && styles.planCardOn]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                  >
                    <View style={[styles.radio, on && styles.radioOn]}>
                      {on && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}
                    </View>
                    <View style={styles.planLeft}>
                      <View style={styles.planNameRow}>
                        <Text style={styles.planName}>{p.name}</Text>
                        {p.badge && <View style={styles.saveBadge}><Text style={styles.saveBadgeText}>{p.badge}</Text></View>}
                      </View>
                      <Text style={styles.planSub}>{p.sub}</Text>
                    </View>
                    <Text style={styles.planPrice}>{p.price}<Text style={styles.planPer}>{p.per}</Text></Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.cta}>
              {buying
                ? <ActivityIndicator color={PINK} size="large" style={{ paddingVertical: 16 }} />
                : <PinkButton title="Start Free Trial" onPress={handleSubscribe} />}
            </View>
            <View style={styles.noPaymentRow}>
              <Ionicons name="checkmark-circle" size={16} color={PINK} />
              <Text style={styles.noPayment}>No payment due now. But soon, pig.</Text>
            </View>
            {/* Apple requires auto-renew terms and these links on subscription screens */}
            <Text style={styles.legalNote}>
              After the 7-day free trial, the plan renews automatically at the price shown until you cancel. Cancel anytime in Settings › Apple ID › Subscriptions, at least 24 hours before renewal.
            </Text>
            <View style={styles.legalRow}>
              <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}>
                <Text style={styles.legalLink}>Terms of Use</Text>
              </TouchableOpacity>
              <Text style={styles.legalDot}>·</Text>
              <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  restoreBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  restore: { fontSize: 13, fontWeight: "700", color: INK },
  closeBtn: { backgroundColor: "#FFFFFF", borderColor: "rgba(247,160,178,0.35)", shadowColor: "#C9A0B0", shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },

  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(247,160,178,0.35)" },
  dotActive: { width: 20, backgroundColor: PINK },

  page: { paddingHorizontal: 24, alignItems: "center", paddingTop: 12, paddingBottom: 28 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  proBadge: {
    backgroundColor: PINK, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1.5, borderColor: "#FFFFFF",
    shadowColor: "#E97C95", shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  proBadgeText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", letterSpacing: 1.5 },
  pageTitle: {
    fontSize: 30, fontWeight: "900", color: INK, textAlign: "center",
    letterSpacing: -1.2, lineHeight: 34, marginTop: 18, marginBottom: 18, ...OUTLINE,
  },

  features: { alignSelf: "stretch", gap: 10 },
  featureCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#FFFFFF", borderRadius: 20, paddingVertical: 14, paddingHorizontal: 16,
    shadowColor: "#C9A0B0", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 10,
  },
  featureIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: PINK,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.7)",
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: "900", color: INK, letterSpacing: -0.3, marginBottom: 2 },
  featureBody: { fontSize: 13.5, fontWeight: "500", color: "#5A5054", lineHeight: 19 },

  cta: { alignSelf: "stretch", marginTop: 22 },
  previewLabel: { alignSelf: "flex-start", fontSize: 12, fontWeight: "800", color: INK, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 22, marginBottom: 10 },

  pricingSub: { fontSize: 15, fontWeight: "500", color: INK, textAlign: "center", marginTop: -10, marginBottom: 18 },
  plans: { alignSelf: "stretch", gap: 12 },
  planCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#FFFFFF", borderRadius: 20, paddingVertical: 16, paddingHorizontal: 16,
    borderWidth: 3, borderColor: "transparent",
    shadowColor: "#C9A0B0", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 10,
  },
  planCardOn: { borderColor: PINK },
  radio: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "rgba(45,45,45,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  radioOn: { backgroundColor: PINK, borderColor: PINK },
  planLeft: { flex: 1 },
  planNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  planName: { fontSize: 17, fontWeight: "900", color: INK, letterSpacing: -0.3 },
  planSub: { fontSize: 13, fontWeight: "500", color: "#5A5054", marginTop: 2 },
  planPrice: { fontSize: 22, fontWeight: "900", color: INK, letterSpacing: -0.8 },
  planPer: { fontSize: 13, fontWeight: "700", color: "#5A5054", letterSpacing: 0 },
  saveBadge: { backgroundColor: PINK, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  saveBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },

  noPaymentRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
  noPayment: { fontSize: 13, fontWeight: "600", color: INK },
  legalNote: { fontSize: 11, fontWeight: "500", color: "#6E6468", textAlign: "center", lineHeight: 15, marginTop: 14 },
  legalRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  legalLink: { fontSize: 12, fontWeight: "700", color: INK, textDecorationLine: "underline" },
  legalDot: { fontSize: 12, color: "#6E6468" },
});
