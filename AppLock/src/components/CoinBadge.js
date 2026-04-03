import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C, T } from "../utils/theme";

// Displays piggy coin count with a small coin icon
export default function CoinBadge({ amount, size = "normal" }) {
  const isSmall = size === "small";

  return (
    <View style={[styles.badge, isSmall && styles.badgeSmall]}>
      <View style={[styles.coin, isSmall && styles.coinSmall]}>
        <Text style={[styles.coinP, isSmall && styles.coinPSmall]}>P</Text>
      </View>
      <Text style={[styles.amount, isSmall && styles.amountSmall]}>
        {amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.pinkPale,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  coin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.pink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  coinSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  coinP: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "900",
  },
  coinPSmall: {
    fontSize: 9,
  },
  amount: {
    fontSize: 15,
    fontWeight: "800",
    color: C.pink,
  },
  amountSmall: {
    fontSize: 13,
  },
});
