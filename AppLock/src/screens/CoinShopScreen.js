import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAppLock, COIN_PACKAGES } from "../context/AppLockContext";
import PigMascot from "../components/PigMascot";
import CoinBadge from "../components/CoinBadge";
import { C, T, CARD_SHADOW, CARD_SHADOW_LG } from "../utils/theme";

export default function CoinShopScreen({ navigation }) {
  const { state, dispatch } = useAppLock();
  const [buying, setBuying] = useState(null);

  const isLow = state.piggyCoins < 10;
  const isEmpty = state.piggyCoins === 0;

  const handleBuy = (pkg) => {
    setBuying(pkg.id);

    // TODO: Replace with real Stripe checkout
    // In production, this would:
    // 1. Call your backend to create a Stripe PaymentIntent
    // 2. Open Stripe's payment sheet
    // 3. On success, backend confirms and you add coins
    //
    // For now, simulating a purchase for testing:
    setTimeout(() => {
      Alert.alert(
        "Good piggy.",
        `${pkg.coins} coins added to your slop bucket.\n\nYou just handed over $${pkg.price.toFixed(2)} because a cartoon pig told you to. Think about that.`,
        [
          {
            text: "Oink.",
            onPress: () => {
              dispatch({
                type: "BUY_COINS",
                payload: { coins: pkg.coins, price: pkg.price },
              });
            },
          },
        ]
      );
      setBuying(null);
    }, 800);
  };

  const getLowBalanceMessage = () => {
    if (isEmpty) {
      return "Your trough is empty. You can't unlock anything until you buy more coins. Did you think freedom was free?";
    }
    if (state.piggyCoins < 5) {
      return "Almost out of coins. You'll be locked out of everything soon. Better stock up before withdrawal hits.";
    }
    return "Running low. At the rate you burn through these, you'll be broke by tomorrow.";
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
          <Text style={styles.shopTitle}>Piggy Coins</Text>
          <View style={styles.balanceWrap}>
            <CoinBadge amount={state.piggyCoins} />
          </View>
          <Text style={styles.balanceLabel}>current balance</Text>
        </View>

        {/* Low balance warning */}
        {isLow && (
          <View style={[styles.warningCard, CARD_SHADOW]}>
            <Text style={styles.warningTitle}>
              {isEmpty ? "EMPTY TROUGH" : "LOW BALANCE"}
            </Text>
            <Text style={styles.warningBody}>{getLowBalanceMessage()}</Text>
          </View>
        )}

        {/* Packages */}
        <Text style={styles.sectionTitle}>Buy Coins</Text>
        <Text style={styles.sectionSub}>
          Feed the machine. Every coin funds your own captivity.
        </Text>

        {COIN_PACKAGES.map((pkg) => {
          const isPopular = pkg.id === "medium";
          return (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.pkgCard,
                CARD_SHADOW,
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
                <Text style={styles.pkgPrice}>${pkg.price.toFixed(2)}</Text>
                <Text style={styles.pkgPer}>
                  ${(pkg.price / pkg.coins).toFixed(3)}/coin
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Purchase history */}
        <View style={[styles.historyCard, CARD_SHADOW]}>
          <Text style={styles.historyTitle}>YOUR TRIBUTE HISTORY</Text>
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
        </View>

        {/* Footer taunt */}
        <Text style={styles.footer}>
          Every purchase is non-refundable. Not because of our policy, but
          because you and I both know you'd spend it again anyway.
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
  historyTitle: { ...T.label, marginBottom: 14 },
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
