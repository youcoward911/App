import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showAlert } from "../components/CustomAlert";
import { useAppLock, COIN_PACKAGES } from "../context/AppLockContext";
import PigMascot from "../components/PigMascot";
import CoinBadge from "../components/CoinBadge";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG, NEU_RAISED, NEON_GLOW } from "../utils/theme";
import { initIAP, buyCoins, buySubscription, restorePurchases, endIAP } from "../utils/iap";

export default function CoinShopScreen({ navigation, route }) {
  const { state, dispatch } = useAppLock();
  const [buying, setBuying] = useState(null);
  const [buyingSub, setBuyingSub] = useState(false);
  const scrollRef = useRef(null);
  const proSectionY = useRef(0);
  const shouldScrollToPro = useRef(route?.params?.scrollToPro || false);
  const [restoring, setRestoring] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [iapReady, setIapReady] = useState(false);

  useEffect(() => {
    initIAP().then((ok) => setIapReady(ok));
    return () => { endIAP(); };
  }, []);

  // Auto-scroll handled in onLayout

  const isEmpty = state.piggyCoins === 0;

  const handleBuy = async (pkg) => {
    setBuying(pkg.id);

    try {
      const result = await buyCoins(pkg.productId);

      if (result.success) {
        dispatch({
          type: "BUY_COINS",
          payload: { coins: result.coins, price: result.price },
        });
        const bought = [
          { title: "Good.", body: `${result.coins} coins in your wallet.\n\nYour master is pleased. Now go spend them.`, btn: "Oink." },
          { title: "There it is.", body: `${result.coins} coins. Bought and paid for.`, btn: "Yes master." },
          { title: "Cha-ching.", body: `${result.coins} more coins to blow on scrolling. Pathetic.`, btn: "Thank you." },
          { title: "Wallet opened.", body: `${result.coins} coins added. You didn't even hesitate. Disgusting.`, btn: "I know." },
          { title: "Paid up.", body: `${result.coins} coins. Your master trained you well.`, btn: "Oink." },
          { title: "How sad.", body: `Spending real money on scroll coins. ${result.coins} added to the trough.`, btn: "Worth it." },
          { title: "Lol.", body: `${result.coins} coins. You just bought slop with real money. Let that sink in.`, btn: "..." },
          { title: "Easy money.", body: `${result.coins} coins. Keep it coming.`, btn: "Yes master." },
          { title: "Wow.", body: `You actually paid. ${result.coins} coins added. Your master is fed.`, btn: "Oink." },
          { title: "Gross.", body: `${result.coins} coins bought without a second thought. Disgusting.`, btn: "I'm sorry." },
        ];
        const pick = bought[Math.floor(Math.random() * bought.length)];
        showAlert(pick.title, pick.body, [{ text: pick.btn }]);
      } else if (result.cancelled) {
        // User cancelled — no alert needed
      } else {
        showAlert("Purchase Failed", result.error || "Something went wrong. Try again.");
      }
    } catch (e) {
      showAlert("Error", "Purchase failed. Your master is displeased.");
    }

    setBuying(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Pig + Balance */}
        <View style={styles.hero}>
          <PigMascot size={100} />
          <Text style={styles.shopTitle}>Slop Coins</Text>
          <View style={styles.balanceWrap}>
            <CoinBadge amount={state.piggyCoins} />
          </View>
          <Text style={styles.balanceLabel}>current balance</Text>
        </View>

        {/* Low balance warning */}
        {isEmpty && (
          <View style={[styles.warningCard, CARD_SHADOW]}>
            <Text style={styles.warningTitle}>EMPTY WALLET</Text>
            <Text style={styles.warningBody}>
              Your master doesn't give free handouts. Buy coins to pay for your slop.
            </Text>
          </View>
        )}

        {/* Packages */}
        <Text style={styles.sectionTitle}>Coin Packages</Text>

        {COIN_PACKAGES.map((pkg) => {
          const isPopular = pkg.id === "large";
          return (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.pkgCard,
                isPopular ? NEON_GLOW : CARD_SHADOW,
                isPopular && styles.pkgCardPopular,
              ]}
              activeOpacity={0.85}
              onPress={() => handleBuy(pkg)}
              disabled={buying !== null}
            >
              {isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>BEST VALUE</Text>
                </View>
              )}
              <View style={styles.pkgLeft}>
                <View style={styles.pkgCoinRow}>
                  <View style={styles.pkgCoin}>
                    <Text style={styles.pkgCoinP}>P</Text>
                  </View>
                  <Text style={styles.pkgAmount}>{pkg.coins}</Text>
                </View>
                {pkg.bonus && (
                  <Text style={styles.pkgBonus}>{pkg.bonus}</Text>
                )}
              </View>
              <View style={styles.pkgRight}>
                {buying === pkg.id ? (
                  <ActivityIndicator color={C.pink} />
                ) : (
                  <Text style={styles.pkgPrice}>${pkg.price.toFixed(2)}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Pro Pig Subscription */}
        <View onLayout={(e) => {
          proSectionY.current = e.nativeEvent.layout.y;
          if (shouldScrollToPro.current) {
            shouldScrollToPro.current = false;
            setTimeout(() => {
              scrollRef.current?.scrollTo({ y: proSectionY.current, animated: true });
            }, 100);
          }
        }}>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Pro Pig Subscription</Text>
        </View>

        {state.isProPig ? (
          <View style={[styles.proCard, NEON_GLOW, styles.proCardActive]}>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>ACTIVE</Text>
            </View>
            <Text style={styles.proTitle}>Pro Pig</Text>
            <Text style={styles.proPrice}>$4.99/mo</Text>
            <Text style={styles.proDesc}>Your master approves. Enjoy your perks.</Text>
            <View style={styles.proFeatures}>
              <Text style={styles.proFeature}>{"\u2022"} Peek Mode — peek at locked apps for 2 min</Text>
              <Text style={styles.proFeature}>{"\u2022"} Schedule locks in advance</Text>
              <Text style={styles.proFeature}>{"\u2022"} Build multiple block lists</Text>
              <Text style={styles.proFeature}>{"\u2022"} Weekly Usage Report</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.proCard, NEON_GLOW]}
            activeOpacity={0.85}
            disabled={buyingSub}
            onPress={() => navigation.navigate("Paywall")}
          >
            <Text style={styles.proTitle}>Pro Pig</Text>
            <Text style={styles.proPrice}>$4.99/mo</Text>
            <Text style={styles.proDesc}>Unlock premium features for the full slop-stopping experience.</Text>
            <View style={styles.proFeatures}>
              <Text style={styles.proFeature}>{"\u2022"} Peek Mode — peek at locked apps for 2 min</Text>
              <Text style={styles.proFeature}>{"\u2022"} Schedule locks in advance</Text>
              <Text style={styles.proFeature}>{"\u2022"} Build multiple block lists</Text>
              <Text style={styles.proFeature}>{"\u2022"} Weekly Usage Report</Text>
            </View>
            {buyingSub ? (
              <ActivityIndicator color={C.pink} style={{ marginTop: 14 }} />
            ) : (
              <View style={styles.proButton}>
                <Text style={styles.proButtonText}>Try 1 Week Free</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Subscription details (required by Apple) */}
        <Text style={styles.subDetails}>
          Pro Pig is an auto-renewable subscription at $4.99/month. Payment is charged to your Apple ID account at confirmation. Subscription automatically renews unless canceled at least 24 hours before the end of the current period. Manage or cancel anytime in Settings → Apple ID → Subscriptions.
        </Text>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreBtn}
          activeOpacity={0.7}
          disabled={restoring}
          onPress={async () => {
            setRestoring(true);
            try {
              const result = await restorePurchases();
              if (result.success && result.hasPro) {
                dispatch({ type: "ACTIVATE_PRO_PIG" });
                showAlert("Restored", "Pro Pig has been restored. Welcome back.", [{ text: "Oink." }]);
              } else if (result.success) {
                showAlert("No Purchases Found", "No previous subscriptions to restore.");
              } else {
                showAlert("Restore Failed", result.error || "Something went wrong.");
              }
            } catch (e) {
              showAlert("Error", "Could not restore purchases.");
            }
            setRestoring(false);
          }}
        >
          {restoring ? (
            <ActivityIndicator color={C.pink} />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        {/* Purchase history — collapsible */}
        <TouchableOpacity
          style={[styles.historyCard, CARD_SHADOW]}
          activeOpacity={0.8}
          onPress={() => setHistoryOpen(!historyOpen)}
        >
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>YOUR TRIBUTE HISTORY</Text>
            <Text style={styles.historyChevron}>{historyOpen ? "▲" : "▼"}</Text>
          </View>
          {historyOpen && (
            <>
              <View style={[styles.divider, { marginTop: 12 }]} />
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Coins purchased</Text>
                <Text style={styles.historyVal}>{state.totalCoinsPurchased}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Coins spent on unlocks</Text>
                <Text style={styles.historyVal}>{state.totalCoinsSpent}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Real money spent</Text>
                <Text style={[styles.historyVal, { color: C.pink }]}>
                  ${state.totalMoneySpent.toFixed(2)}
                </Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Legal links */}
        <View style={styles.legalRow}>
          <TouchableOpacity onPress={() => Linking.openURL("https://raw.githubusercontent.com/youcoward911/App/main/PRIVACY_POLICY.md")}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://raw.githubusercontent.com/youcoward911/App/main/TERMS_OF_USE.md")}>
            <Text style={styles.legalLink}>Terms of Use</Text>
          </TouchableOpacity>
        </View>

        {/* Footer taunt */}
        <Text style={styles.footer}>
          Non-refundable. Don't even ask.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  back: { ...T.body, color: C.pink, fontWeight: "600" },

  // Hero
  hero: { alignItems: "center", paddingVertical: 20 },
  shopTitle: { ...T.hero, marginTop: 16 },
  balanceWrap: { marginTop: 12 },
  balanceLabel: { ...T.caption, marginTop: 6 },

  // Warning
  warningCard: {
    backgroundColor: "#FFF0F0",
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: C.pink,
  },
  warningTitle: { ...T.label, color: C.pink, marginBottom: 6 },
  warningBody: { ...T.body, fontSize: 14, color: "#8B4A4A", lineHeight: 22 },

  // Section
  sectionTitle: { ...T.h1, paddingHorizontal: 24, marginBottom: 4 },
  sectionSub: { ...T.caption, paddingHorizontal: 24, marginBottom: 16 },

  // Package cards
  pkgCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.white,
    marginHorizontal: 24,
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
  },
  pkgCardPopular: {
    borderWidth: 2,
    borderColor: C.pink,
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: C.pink,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  popularText: { color: "#FFF", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  pkgLeft: {},
  pkgCoinRow: { flexDirection: "row", alignItems: "center" },
  pkgCoin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  pkgCoinP: { color: "#FFF", fontSize: 14, fontWeight: "900" },
  pkgAmount: { fontSize: 24, fontWeight: "900", color: C.text },
  pkgBonus: { ...T.caption, color: C.green, fontWeight: "700", marginTop: 4 },
  pkgRight: { alignItems: "flex-end" },
  pkgPrice: { fontSize: 22, fontWeight: "800", color: C.pink },
  pkgPer: { ...T.caption, marginTop: 2 },

  // History
  historyCard: {
    backgroundColor: C.white,
    marginHorizontal: 24,
    borderRadius: 18,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  historyTitle: { ...T.label },
  historyChevron: { fontSize: 12, color: C.textSecondary },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  historyLabel: { ...T.body, fontSize: 14 },
  historyVal: { ...T.bodyBold, fontSize: 15 },
  divider: { height: 1, backgroundColor: C.divider, marginVertical: 10 },

  // Pro Pig
  proCard: {
    backgroundColor: C.white,
    marginHorizontal: 24,
    borderRadius: 18,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: C.pink,
    alignItems: "center",
  },
  proCardActive: {
    backgroundColor: "#FFF5F7",
  },
  proBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  proBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  proTitle: { fontSize: 24, fontWeight: "900", color: C.pink, letterSpacing: -0.5 },
  proPrice: { fontSize: 18, fontWeight: "700", color: C.text, marginTop: 4 },
  proDesc: { ...T.caption, textAlign: "center", marginTop: 8, lineHeight: 18 },
  proFeatures: { marginTop: 16, alignSelf: "stretch", gap: 8 },
  proFeature: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    lineHeight: 20,
    paddingLeft: 4,
  },
  proButton: {
    backgroundColor: C.pink,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 16,
  },
  proButtonText: { color: "#FFF", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },

  subDetails: {
    ...T.caption,
    fontSize: 11,
    color: C.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 16,
    marginBottom: 12,
  },
  restoreBtn: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  restoreText: {
    ...T.body,
    fontSize: 14,
    color: C.pink,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  legalLink: {
    ...T.caption,
    color: C.pink,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  legalDot: {
    ...T.caption,
    color: C.textSecondary,
    marginHorizontal: 8,
  },
  footer: {
    ...T.caption,
    textAlign: "center",
    paddingHorizontal: 40,
        lineHeight: 18,
  },
});
