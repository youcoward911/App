const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const APPLE_VERIFY_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

// Coin amounts per product
const PRODUCT_COINS = {
  "scrollpiggy.coins.50": 50,
  "scrollpiggy.coins.120": 120,
  "scrollpiggy.coins.250": 250,
};

const PRODUCT_PRICES = {
  "scrollpiggy.coins.50": 4.99,
  "scrollpiggy.coins.120": 9.99,
  "scrollpiggy.coins.250": 19.99,
};

async function verifyWithApple(receiptData, useSandbox = false) {
  const url = useSandbox ? APPLE_SANDBOX_URL : APPLE_VERIFY_URL;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "receipt-data": receiptData }),
  });
  return res.json();
}

exports.validateReceipt = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in");
  }

  const { receiptData, productId } = request.data;
  if (!receiptData || !productId) {
    throw new HttpsError("invalid-argument", "Missing receiptData or productId");
  }

  const uid = request.auth.uid;

  // Try production first
  let result = await verifyWithApple(receiptData, false);

  // Status 21007 means it's a sandbox receipt
  if (result.status === 21007) {
    result = await verifyWithApple(receiptData, true);
  }

  if (result.status !== 0) {
    throw new HttpsError("permission-denied", `Receipt invalid: status ${result.status}`);
  }

  // Extract transaction ID from receipt
  const inApp = result.receipt?.in_app || [];
  const latest = inApp[inApp.length - 1];
  const transactionId = latest?.transaction_id || `manual_${Date.now()}`;

  // Check for duplicate transaction
  const existing = await db.collection("transactions")
    .where("transactionId", "==", transactionId)
    .limit(1)
    .get();

  if (!existing.empty) {
    // Already processed — return success without double-crediting
    return { valid: true, coins: 0, duplicate: true };
  }

  const coins = PRODUCT_COINS[productId] || 0;
  const price = PRODUCT_PRICES[productId] || 0;
  const environment = result.environment || "Production";

  // Record transaction
  await db.collection("transactions").add({
    uid,
    productId,
    transactionId,
    coins,
    price,
    environment,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { valid: true, coins };
});

exports.validateSubscription = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be signed in");
  }

  const { receiptData } = request.data;
  if (!receiptData) {
    throw new HttpsError("invalid-argument", "Missing receiptData");
  }

  // Try production first
  let result = await verifyWithApple(receiptData, false);
  if (result.status === 21007) {
    result = await verifyWithApple(receiptData, true);
  }

  if (result.status !== 0) {
    throw new HttpsError("permission-denied", `Receipt invalid: status ${result.status}`);
  }

  // Check latest_receipt_info for active subscription
  const latestInfo = result.latest_receipt_info || [];
  const now = Date.now();
  const activeSub = latestInfo.find((info) => {
    const expiresMs = parseInt(info.expires_date_ms, 10);
    return expiresMs > now;
  });

  return {
    valid: true,
    isActive: !!activeSub,
    expiresDate: activeSub ? parseInt(activeSub.expires_date_ms, 10) : null,
  };
});
