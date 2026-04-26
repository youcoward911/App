// Real StoreKit IAP via expo-iap.
// Products are configured in App Store Connect.
import { Platform } from "react-native";
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
} from "expo-iap";

// StoreKit product IDs — must match App Store Connect
export const PRODUCT_IDS = [
  "scrollpiggy.coins.50",
  "scrollpiggy.coins.120",
  "scrollpiggy.coins.250",
];

export const SUBSCRIPTION_ID = "scrollpiggy.pro.monthly";

// Map product IDs to coin amounts
export const PRODUCT_COINS = {
  "scrollpiggy.coins.50": 50,
  "scrollpiggy.coins.120": 120,
  "scrollpiggy.coins.250": 250,
};

// Map product IDs to prices (fallback display only — actual price comes from StoreKit)
export const PRODUCT_PRICES = {
  "scrollpiggy.coins.50": 4.99,
  "scrollpiggy.coins.120": 9.99,
  "scrollpiggy.coins.250": 19.99,
};

let connected = false;
let products = null;
let updateSub = null;
let errorSub = null;

// Pending purchase resolver — single in-flight purchase at a time
let pendingResolver = null;
let pendingProductId = null;

export let iapAvailable = false;

export async function initIAP() {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    iapAvailable = false;
    return false;
  }
  if (connected) return true;

  try {
    await initConnection();
    connected = true;

    // Set up purchase listeners once
    updateSub = purchaseUpdatedListener(async (purchase) => {
      try {
        // Finish (consume) the transaction so it can be bought again
        await finishTransaction({ purchase, isConsumable: true });
      } catch (e) {
        console.warn("finishTransaction failed:", e);
      }
      if (pendingResolver) {
        const sku = purchase?.productId || purchase?.id || pendingProductId;
        pendingResolver({
          success: true,
          coins: PRODUCT_COINS[sku] || 0,
          price: PRODUCT_PRICES[sku] || 0,
        });
        pendingResolver = null;
        pendingProductId = null;
      }
    });

    errorSub = purchaseErrorListener((error) => {
      if (pendingResolver) {
        // Code 2 / "E_USER_CANCELLED" = user cancelled
        const code = error?.code || "";
        const cancelled =
          code === "E_USER_CANCELLED" ||
          code === "USER_CANCELLED" ||
          /cancel/i.test(error?.message || "");
        pendingResolver({
          success: false,
          cancelled,
          error: error?.message || "Purchase failed",
        });
        pendingResolver = null;
        pendingProductId = null;
      }
    });

    // Pre-fetch products
    try {
      const result = await fetchProducts({
        skus: PRODUCT_IDS,
        type: "in-app",
      });
      products = Array.isArray(result) ? result : result?.products || [];
    } catch (e) {
      console.warn("fetchProducts failed:", e);
    }

    iapAvailable = true;
    return true;
  } catch (e) {
    console.warn("initIAP failed:", e);
    iapAvailable = false;
    return false;
  }
}

export async function getProducts() {
  if (!connected) return null;
  if (products) return products;
  try {
    const result = await fetchProducts({
      skus: PRODUCT_IDS,
      type: "in-app",
    });
    products = Array.isArray(result) ? result : result?.products || [];
    return products;
  } catch (e) {
    console.warn("getProducts failed:", e);
    return null;
  }
}

export async function buyCoins(productId) {
  if (!connected) {
    const ok = await initIAP();
    if (!ok) {
      return { success: false, error: "Store unavailable" };
    }
  }

  // Wait for any previous purchase to clear
  if (pendingResolver) {
    return { success: false, error: "Another purchase is in progress" };
  }

  return new Promise((resolve) => {
    // Safety timeout — if nothing comes back in 3 minutes, fail
    const timeout = setTimeout(() => {
      if (pendingResolver) {
        pendingResolver = null;
        pendingProductId = null;
        resolve({ success: false, error: "Purchase timed out" });
      }
    }, 180000);

    pendingProductId = productId;
    pendingResolver = (result) => {
      clearTimeout(timeout);
      resolve(result);
    };

    requestPurchase({
      request: {
        ios: { sku: productId },
        android: { skus: [productId] },
      },
      type: "in-app",
    }).catch((e) => {
      clearTimeout(timeout);
      if (pendingResolver) {
        pendingResolver = null;
        pendingProductId = null;
      }
      const code = e?.code || "";
      const cancelled =
        code === "E_USER_CANCELLED" ||
        code === "USER_CANCELLED" ||
        /cancel/i.test(e?.message || "");
      resolve({
        success: false,
        cancelled,
        error: e?.message || "Purchase failed",
      });
    });
  });
}

export async function buySubscription() {
  if (!connected) {
    const ok = await initIAP();
    if (!ok) return { success: false, error: "Store unavailable" };
  }
  if (pendingResolver) {
    return { success: false, error: "Another purchase is in progress" };
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (pendingResolver) {
        pendingResolver = null;
        pendingProductId = null;
        resolve({ success: false, error: "Purchase timed out" });
      }
    }, 180000);

    pendingProductId = SUBSCRIPTION_ID;
    pendingResolver = (result) => {
      clearTimeout(timeout);
      resolve({ ...result, isSubscription: true });
    };

    requestPurchase({
      request: {
        ios: { sku: SUBSCRIPTION_ID },
        android: { skus: [SUBSCRIPTION_ID] },
      },
      type: "subs",
    }).catch((e) => {
      clearTimeout(timeout);
      if (pendingResolver) {
        pendingResolver = null;
        pendingProductId = null;
      }
      const cancelled = /cancel/i.test(e?.code || e?.message || "");
      resolve({ success: false, cancelled, error: e?.message || "Purchase failed" });
    });
  });
}

export async function restorePurchases() {
  if (!connected) {
    const ok = await initIAP();
    if (!ok) return { success: false, error: "Store unavailable" };
  }

  try {
    // Fetch available subscriptions to check receipt
    const result = await fetchProducts({
      skus: [SUBSCRIPTION_ID],
      type: "subs",
    });
    // On iOS, restoring triggers purchaseUpdatedListener for each owned item
    // We use getAvailablePurchases from expo-iap
    const { getAvailablePurchases } = require("expo-iap");
    const purchases = await getAvailablePurchases();
    const hasPro = purchases?.some(
      (p) => p.productId === SUBSCRIPTION_ID || p.id === SUBSCRIPTION_ID
    );
    return { success: true, hasPro };
  } catch (e) {
    return { success: false, error: e?.message || "Restore failed" };
  }
}

export function listenForPurchases() {
  return () => {};
}

export async function endIAP() {
  try {
    if (updateSub) {
      updateSub.remove?.();
      updateSub = null;
    }
    if (errorSub) {
      errorSub.remove?.();
      errorSub = null;
    }
    if (connected) {
      await endConnection();
      connected = false;
    }
  } catch (e) {}
}
