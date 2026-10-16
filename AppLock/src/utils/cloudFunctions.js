import { getFunctions, httpsCallable } from "firebase/functions";
import { initializeApp, getApp } from "firebase/app";

let functions = null;

function getFunctionsInstance() {
  if (!functions) {
    const app = getApp();
    functions = getFunctions(app);
  }
  return functions;
}

export async function callValidateReceipt(receiptData, productId) {
  const fn = httpsCallable(getFunctionsInstance(), "validateReceipt");
  const result = await fn({ receiptData, productId });
  return result.data;
}

export async function callValidateSubscription(receiptData) {
  const fn = httpsCallable(getFunctionsInstance(), "validateSubscription");
  const result = await fn({ receiptData });
  return result.data;
}
