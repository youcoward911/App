import { getAnalytics, logEvent as firebaseLogEvent, setUserProperties as firebaseSetUserProperties } from "firebase/analytics";
import { getApp } from "firebase/app";
import { Platform } from "react-native";

let analytics = null;

function getAnalyticsInstance() {
  if (!analytics) {
    try {
      const app = getApp();
      analytics = getAnalytics(app);
    } catch (e) {
      // Analytics not available (e.g., web without config, or native without google-services)
      console.warn("Firebase Analytics not available:", e.message);
    }
  }
  return analytics;
}

export function logEvent(eventName, params = {}) {
  const instance = getAnalyticsInstance();
  if (!instance) return;
  try {
    firebaseLogEvent(instance, eventName, {
      ...params,
      platform: Platform.OS,
    });
  } catch (e) {
    // Silently fail — analytics should never block the app
  }
}

export function setUserProperties(props) {
  const instance = getAnalyticsInstance();
  if (!instance) return;
  try {
    firebaseSetUserProperties(instance, props);
  } catch (e) {}
}

// Standard event names
export const Events = {
  APP_OPEN: "app_open",
  LOCK_CREATED: "lock_created",
  TRIBUTE_PAID: "tribute_paid",
  COINS_PURCHASED: "coins_purchased",
  SKIN_EQUIPPED: "skin_equipped",
  LEVEL_UP: "level_up",
  APPLE_SIGN_IN: "apple_sign_in",
};
