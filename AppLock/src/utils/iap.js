import { Platform, NativeModules } from "react-native";

let RNIap = null;
let iapAvailable = false;

try {
  RNIap = require("react-native-iap");
  // Check that the NATIVE module is actually linked, not just the JS package.
  // The JS package can exist in node_modules without the native binary compiled in.
  const hasNative = !!(
    NativeModules.RNIapModule ||
    NativeModules.RNIapIos ||
    NativeModules.RNIap
  );
  if (RNIap && hasNative) {
    iapAvailable = true;
  } else {
    RNIap = null;
  }
} catch (e) {
  console.warn("react-native-iap not available, using mock purchases");
}

// StoreKit product IDs — must match App Store Connect
export const PRODUCT_IDS = [
  "scrollpiggy.coins.50",
  "scrollpiggy.coins.120",
  "scrollpiggy.coins.250",
];

// Map product IDs to coin amounts
export const PRODUCT_COINS = {
  "scrollpiggy.coins.50": 50,
  "scrollpiggy.coins.120": 120,
  "scrollpiggy.coins.250": 250,
};

// Map product IDs to prices (fallback if StoreKit unavailable)
export const PRODUCT_PRICES = {
  "scrollpiggy.coins.50": 4.99,
  "scrollpiggy.coins.120": 9.99,
  "scrollpiggy.coins.250": 19.99,
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
  if (!iapAvailable || !RNIap) {
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
    // If native module is missing, fall back to mock
    if (e.message && e.message.toLowerCase().includes("null")) {
      console.warn("IAP native module missing, falling back to mock purchase");
      iapAvailable = false;
      RNIap = null;
      return {
        success: true,
        coins: PRODUCT_COINS[productId] || 0,
        price: PRODUCT_PRICES[productId] || 0,
        mock: true,
      };
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
