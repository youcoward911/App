import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAppLock, COIN_PACKAGES } from "../context/AppLockContext";
import PigMascot from "../components/PigMascot";
import CoinBadge from "../components/CoinBadge";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG, NEON_GLOW } from "../utils/theme";
import { initIAP, buyCoins, endIAP, iapAvailable } from "../utils/iap";

export default function CoinShopScreen({ navigation }) {
  const { state, dispatch } = useAppLock();
  const [buying, setBuying] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [iapReady, setIapReady] = useState(false);

  useEffect(() => {
    initIAP().then((ok) => setIapReady(ok));
    return () => { endIAP(); };
  }, []);

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
        const mockNote = result.mock ? "\n\n(Test purchase)" : "";
        const bought = [
          { title: "Good pig.", body: `${result.coins} coins in your wallet.${mockNote}\n\nYour master is pleased. Now go spend them.`, btn: "Oink." },
          { title: "There it is.", body: `${result.coins} coins. Bought and paid for like a good little piggy.${mockNote}`, btn: "Yes master." },
          { title: "Cha-ching.", body: `${result.coins} more coins for the pig to blow on scrolling. Pathetic.${mockNote}`, btn: "Thank you." },
          { title: "Wallet opened.", body: `${result.coins} coins added. You didn't even hesitate. Disgusting.${mockNote}`, btn: "I know." },
          { title: "Paid up.", body: `${result.coins} coins. Your master trained you well, piggy.${mockNote}`, btn: "Oink." },
          { title: "How sad.", body: `Spending real money on scroll coins. ${result.coins} added to the trough.${mockNote}`, btn: "Worth it." },
          { title: "Lol.", body: `${result.coins} coins. You just bought slop with real money. Let that sink in.${mockNote}`, btn: "..." },
          { title: "Easy money.", body: `${result.coins} coins from my favorite little pay pig. Keep it coming.${mockNote}`, btn: "Yes master." },
          { title: "Wow.", body: `You actually paid. ${result.coins} coins added. Your master is fed.${mockNote}`, btn: "Oink." },
          { title: "Gross.", body: `${result.coins} coins bought without a second thought. Absolute pig behavior.${mockNote}`, btn: "I'm sorry." },
        ];
        const pick = bought[Math.floor(Math.random() * bought.length)];
        Alert.alert(pick.title, pick.body, [{ text: pick.btn }]);
      } else if (result.cancelled) {
        // User cancelled — no alert needed
      } else {
        Alert.alert("Purchase Failed", result.error || "Something went wrong. Try again, pig.");
      }
    } catch (e) {
      Alert.alert("Error", "Purchase failed. Your master is displeased.");
    }

    setBuying(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
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

  footer: {
    ...T.caption,
    textAlign: "center",
    paddingHorizontal: 40,
    fontStyle: "italic",
    lineHeight: 18,
  },
});
