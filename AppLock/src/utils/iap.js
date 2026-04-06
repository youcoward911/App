// IAP is currently disabled (react-native-iap removed due to RN 0.81 incompatibility).
// All purchases are mocked for development. Replace with a compatible IAP
// solution (e.g. expo-iap or RevenueCat) before App Store submission.

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

export const iapAvailable = false;

export async function initIAP() {
  return false;
}

export async function getProducts() {
  return null;
}

export async function buyCoins(productId) {
  return {
    success: true,
    coins: PRODUCT_COINS[productId] || 0,
    price: PRODUCT_PRICES[productId] || 0,
    mock: true,
  };
}

export function listenForPurchases() {
  return () => {};
}

export async function endIAP() {}
