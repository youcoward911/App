import React, { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { requestPermissions, refreshNotifications, onTributePaid, scheduleLockExpiry, scheduleLockExpiryNotification } from "../utils/notifications";
import { trackAppOpen, trackUnlock } from "../utils/usageTracker";
import { updateLeaderboard } from "../utils/leaderboard";

const AppLockContext = createContext();

const STORAGE_KEY = "@paypig_state_v2";

// Keychain key — persists across app reinstalls on iOS so the welcome bonus
// is only ever given once per device.
const WELCOME_BONUS_KEY = "scrollpig_welcome_bonus_claimed";
const WELCOME_BONUS_COINS = 20;

export const COIN_PACKAGES = [
  { id: "small", productId: "scrollpiggy.coins.50", coins: 50, price: 4.99, label: "50 Coins", bonus: null },
  { id: "medium", productId: "scrollpiggy.coins.120", coins: 120, price: 9.99, label: "120 Coins", bonus: "+20 bonus" },
  { id: "large", productId: "scrollpiggy.coins.250", coins: 250, price: 19.99, label: "250 Coins", bonus: "+50 bonus" },
];

// Fee tier presets: [peekFee, fullUnlockFee]
export const FEE_TIERS = [
  { label: "1 / 10", peek: 1, full: 10 },
  { label: "2 / 20", peek: 2, full: 20 },
  { label: "3 / 30", peek: 3, full: 30 },
  { label: "4 / 40", peek: 4, full: 40 },
];

// Duration presets in minutes
export const DURATION_PRESETS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "90 min", minutes: 90 },
];

const initialState = {
  lockedApps: {},
  piggyCoins: 0,
  totalCoinsSpent: 0,
  totalCoinsPurchased: 0,
  totalMoneySpent: 0,
  totalUnlocks: 0,
  totalPeeks: 0,
  totalSurrenders: 0, // full unlocks (permanent)
  tributesToday: 0,
  tributesTodayDate: null,
  lastTributeTime: null,
  ironSnoutStreak: 0,    // consecutive natural expirations without peek/unlock
  bestIronSnout: 0,      // all-time best streak
  settings: {
    defaultPeekFee: 1,
    defaultFullFee: 10,
    defaultDuration: 15,   // minutes
    currency: "USD",
    roastIntensity: "medium",
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_STATE":
      return { ...initialState, ...action.payload };

    case "LOCK_APP": {
      const { appId, peekFee, fullFee, durationMinutes } = action.payload;
      const pf = peekFee ?? state.settings.defaultPeekFee;
      const ff = fullFee ?? state.settings.defaultFullFee;
      const dur = durationMinutes ?? state.settings.defaultDuration;
      return {
        ...state,
        lockedApps: {
          ...state.lockedApps,
          [appId]: {
            lockedAt: Date.now(),
            lockExpiresAt: Date.now() + dur * 60 * 1000,
            durationMinutes: dur,
            peekFee: pf,
            fullFee: ff,
            peekCount: 0,           // how many peeks this lock session
            peekExpiresAt: null,    // when current peek window ends
            unlockCountToday: state.lockedApps[appId]?.unlockCountToday ?? 0,
            lastUnlockDate: state.lockedApps[appId]?.lastUnlockDate ?? null,
          },
        },
      };
    }

    // Peek: 1-minute unlock, escalating cost
    case "PEEK_APP": {
      const { appId } = action.payload;
      const app = state.lockedApps[appId];
      if (!app) return state;

      const baseFee = app.peekFee || 1;
      // Escalating: doubles each peek (1, 2, 4, 8, 16...)
      const cost = baseFee * Math.pow(2, app.peekCount);
      const today = new Date().toDateString();
      const isTodaySame = state.tributesTodayDate === today;

      return {
        ...state,
        piggyCoins: Math.max(0, state.piggyCoins - cost),
        totalCoinsSpent: state.totalCoinsSpent + cost,
        totalPeeks: (state.totalPeeks || 0) + 1,
        totalUnlocks: state.totalUnlocks + 1,
        tributesToday: isTodaySame ? (state.tributesToday || 0) + 1 : 1,
        tributesTodayDate: today,
        lastTributeTime: Date.now(),
        // Break the Iron Snout streak on peek
        ironSnoutStreak: 0,
        lockedApps: {
          ...state.lockedApps,
          [appId]: {
            ...app,
            peekCount: app.peekCount + 1,
            peekExpiresAt: Date.now() + 60 * 1000, // 1 minute
          },
        },
      };
    }

    // Full unlock: permanent, costs 10x
    case "UNLOCK_APP": {
      const { appId } = action.payload;
      const app = state.lockedApps[appId];
      if (!app) return state;

      const fee = app.fullFee || 10;
      const today = new Date().toDateString();
      const isTodaySame = state.tributesTodayDate === today;
      const isNewDay = app.lastUnlockDate !== today;
      const newCount = isNewDay ? 1 : (app.unlockCountToday || 0) + 1;

      return {
        ...state,
        piggyCoins: Math.max(0, state.piggyCoins - fee),
        totalCoinsSpent: state.totalCoinsSpent + fee,
        totalUnlocks: state.totalUnlocks + 1,
        totalSurrenders: (state.totalSurrenders || 0) + 1,
        tributesToday: isTodaySame ? (state.tributesToday || 0) + 1 : 1,
        tributesTodayDate: today,
        lastTributeTime: Date.now(),
        // Break the Iron Snout streak on full unlock
        ironSnoutStreak: 0,
        lockedApps: {
          ...state.lockedApps,
          [appId]: {
            ...app,
            lockedAt: null,
            lockExpiresAt: null,
            peekExpiresAt: null,
            peekCount: 0,
            unlockCountToday: newCount,
            lastUnlockDate: today,
          },
        },
      };
    }

    // Timer expired naturally — Iron Snout!
    case "LOCK_EXPIRED": {
      const { appId } = action.payload;
      const app = state.lockedApps[appId];
      if (!app) return state;

      const wasPeeked = app.peekCount > 0;
      const newStreak = wasPeeked ? 1 : (state.ironSnoutStreak || 0) + 1;
      const best = Math.max(state.bestIronSnout || 0, newStreak);

      return {
        ...state,
        ironSnoutStreak: newStreak,
        bestIronSnout: best,
        lockedApps: {
          ...state.lockedApps,
          [appId]: {
            ...app,
            lockedAt: null,
            lockExpiresAt: null,
            peekExpiresAt: null,
            peekCount: 0,
          },
        },
      };
    }

    // Re-lock a peek that expired (back to locked, timer keeps counting)
    case "PEEK_EXPIRED": {
      const { appId } = action.payload;
      const app = state.lockedApps[appId];
      if (!app) return state;
      return {
        ...state,
        lockedApps: {
          ...state.lockedApps,
          [appId]: {
            ...app,
            peekExpiresAt: null,
          },
        },
      };
    }

    case "RELOCK_APP": {
      const { appId, peekFee, fullFee, durationMinutes } = action.payload;
      const app = state.lockedApps[appId];
      if (!app) return state;
      const pf = peekFee ?? app.peekFee ?? state.settings.defaultPeekFee;
      const ff = fullFee ?? app.fullFee ?? state.settings.defaultFullFee;
      const dur = durationMinutes ?? app.durationMinutes ?? state.settings.defaultDuration;
      return {
        ...state,
        lockedApps: {
          ...state.lockedApps,
          [appId]: {
            ...app,
            lockedAt: Date.now(),
            lockExpiresAt: Date.now() + dur * 60 * 1000,
            durationMinutes: dur,
            peekFee: pf,
            fullFee: ff,
            peekCount: 0,
            peekExpiresAt: null,
          },
        },
      };
    }

    case "REMOVE_APP": {
      const newLocked = { ...state.lockedApps };
      delete newLocked[action.payload.appId];
      return { ...state, lockedApps: newLocked };
    }

    case "BUY_COINS": {
      const { coins, price } = action.payload;
      return {
        ...state,
        piggyCoins: state.piggyCoins + coins,
        totalCoinsPurchased: state.totalCoinsPurchased + coins,
        totalMoneySpent: state.totalMoneySpent + price,
      };
    }

    case "WELCOME_BONUS": {
      return {
        ...state,
        piggyCoins: state.piggyCoins + WELCOME_BONUS_COINS,
      };
    }

    case "UPDATE_SETTINGS": {
      const newSettings = { ...state.settings, ...action.payload };
      return { ...state, settings: newSettings };
    }

    default:
      return state;
  }
}

export function AppLockProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        // Clear old v1 data
        await AsyncStorage.removeItem("@paypig_state");
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        await requestPermissions();
        // Cancel any stale notifications from previous sessions
        try {
          const Notifs = require("expo-notifications");
          await Notifs.cancelAllScheduledNotificationsAsync();
        } catch (e) {}
        if (stored) {
          const parsed = JSON.parse(stored);
          dispatch({ type: "LOAD_STATE", payload: parsed });
          // Re-schedule based on last feed
          await refreshNotifications(parsed.lastTributeTime);
        }

        // Welcome bonus — 20 coins on first install only. iOS only.
        // Flag is stored in iOS keychain via expo-secure-store which persists
        // across app uninstall/reinstall, so users can't farm it.
        // Android's SecureStore backend doesn't persist past uninstall, so we
        // skip the bonus there until we have server-side dedup.
        if (Platform.OS === "ios") {
          try {
            const alreadyClaimed = await SecureStore.getItemAsync(WELCOME_BONUS_KEY);
            if (!alreadyClaimed) {
              await SecureStore.setItemAsync(WELCOME_BONUS_KEY, "1");
              dispatch({ type: "WELCOME_BONUS" });
            }
          } catch (e) {
            console.warn("Welcome bonus check failed:", e);
          }
        }

        // Track app open
        await trackAppOpen();
      } catch (e) {
        console.warn("Failed to load state:", e);
      }
    })();
  }, []);

  // Timer checks: lock expiry, peek expiry
  const expiredLocksRef = useRef(new Set());
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      Object.entries(state.lockedApps).forEach(([appId, app]) => {
        // Peek expired — close the peek window
        if (app.peekExpiresAt && now >= app.peekExpiresAt) {
          dispatch({ type: "PEEK_EXPIRED", payload: { appId } });
        }
        // Lock timer expired naturally — only fire once per lock session
        if (app.lockedAt && app.lockExpiresAt && now >= app.lockExpiresAt && !app.peekExpiresAt) {
          if (!expiredLocksRef.current.has(appId)) {
            expiredLocksRef.current.add(appId);
            dispatch({ type: "LOCK_EXPIRED", payload: { appId } });
            scheduleLockExpiry(appId).catch(() => {});
          }
        }
        // Clean up: if the app is re-locked (new lockedAt), remove from expired set
        if (app.lockedAt && app.lockExpiresAt && now < app.lockExpiresAt) {
          expiredLocksRef.current.delete(appId);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.lockedApps]);

  // Schedule lock expiry notifications when new locks are created
  const prevLockedRef = useRef({});
  useEffect(() => {
    const prev = prevLockedRef.current;
    Object.entries(state.lockedApps).forEach(([appId, app]) => {
      if (app.lockExpiresAt && app.lockedAt) {
        const prevApp = prev[appId];
        // New lock or re-lock (different lockExpiresAt)
        if (!prevApp || prevApp.lockExpiresAt !== app.lockExpiresAt) {
          const appInfo = require("../data/defaultApps").POPULAR_APPS.find((a) => a.id === appId);
          scheduleLockExpiryNotification(appInfo?.name || appId, app.lockExpiresAt).catch(() => {});
        }
      }
    });
    prevLockedRef.current = { ...state.lockedApps };
  }, [state.lockedApps]);

  // Reschedule push notifications + update leaderboard when a tribute is paid
  useEffect(() => {
    if (state.lastTributeTime) {
      onTributePaid().catch(() => {});
      updateLeaderboard(state.totalCoinsSpent, state.totalUnlocks).catch(() => {});
    }
  }, [state.lastTributeTime]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.warn("Failed to save state:", e)
    );
  }, [state]);

  return (
    <AppLockContext.Provider value={{ state, dispatch }}>
      {children}
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  const context = useContext(AppLockContext);
  if (!context) throw new Error("useAppLock must be used within AppLockProvider");
  return context;
}
