import { Platform } from "react-native";

let RNIap = null;
let iapAvailable = false;

try {
  RNIap = require("react-native-iap");
  iapAvailable = true;
} catch (e) {
  console.warn("react-native-iap not available, using mock purchases");
}

// StoreKit product IDs — must match App Store Connect
export const PRODUCT_IDS = [
  "scrollpiggy.coins.100",
  "scrollpiggy.coins.220",
  "scrollpiggy.coins.625",
];

// Map product IDs to coin amounts
export const PRODUCT_COINS = {
  "scrollpiggy.coins.100": 100,
  "scrollpiggy.coins.220": 220,
  "scrollpiggy.coins.625": 625,
};

// Map product IDs to prices (fallback if StoreKit unavailable)
export const PRODUCT_PRICES = {
  "scrollpiggy.coins.100": 9.99,
  "scrollpiggy.coins.220": 19.99,
  "scrollpiggy.coins.625": 49.99,
};

let connection = null;
let purchaseListener = null;

export async function initIAP() {
  if (!iapAvailable || Platform.OS !== "ios") return false;

  try {
    connection = await RNIap.initConnection();
    return true;
  } catch (e) {
    console.warn("IAP init failed:", e);
    return false;
  }
}

export async function getProducts() {
  if (!iapAvailable) return null;

  try {
    const products = await RNIap.getProducts({ skus: PRODUCT_IDS });
    return products;
  } catch (e) {
    console.warn("Failed to get products:", e);
    return null;
  }
}

export async function buyCoins(productId) {
  if (!iapAvailable) {
    // Mock purchase for development
    return {
      success: true,
      coins: PRODUCT_COINS[productId] || 0,
      price: PRODUCT_PRICES[productId] || 0,
      mock: true,
    };
  }

  try {
    const purchase = await RNIap.requestPurchase({ sku: productId });
    // Finish the transaction so Apple knows it's delivered
    if (purchase.transactionId) {
      await RNIap.finishTransaction({ purchase, isConsumable: true });
    }
    return {
      success: true,
      coins: PRODUCT_COINS[productId] || 0,
      price: PRODUCT_PRICES[productId] || 0,
      mock: false,
      receipt: purchase.transactionReceipt,
    };
  } catch (e) {
    if (e.code === "E_USER_CANCELLED") {
      return { success: false, cancelled: true };
    }
    console.warn("Purchase failed:", e);
    return { success: false, error: e.message };
  }
}

export function listenForPurchases(onPurchase) {
  if (!iapAvailable || !RNIap) return () => {};

  purchaseListener = RNIap.purchaseUpdatedListener(async (purchase) => {
    const coins = PRODUCT_COINS[purchase.productId] || 0;
    const price = PRODUCT_PRICES[purchase.productId] || 0;

    // Finish the consumable transaction
    await RNIap.finishTransaction({ purchase, isConsumable: true });

    if (onPurchase) {
      onPurchase({ coins, price, productId: purchase.productId });
    }
  });

  const errorListener = RNIap.purchaseErrorListener((error) => {
    if (error.code !== "E_USER_CANCELLED") {
      console.warn("Purchase error:", error);
    }
  });

  return () => {
    if (purchaseListener) purchaseListener.remove();
    if (errorListener) errorListener.remove();
  };
}

export async function endIAP() {
  if (!iapAvailable) return;
  try {
    await RNIap.endConnection();
  } catch (e) {
    // ignore
  }
}

export { iapAvailable };
