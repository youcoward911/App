import React, { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { Platform, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { requestPermissions, refreshNotifications, onTributePaid, scheduleLockExpiry, scheduleLockExpiryNotification } from "../utils/notifications";
import { trackAppOpen, trackUnlock } from "../utils/usageTracker";
import { updateLeaderboard } from "../utils/leaderboard";
import {
  syncToAppGroup,
  syncFromAppGroup,
  isScreenTimeAvailable,
  requestAuthorization,
  getAuthorizationStatus,
  showAppPicker,
  blockSelectedApps,
  unblockApp,
  clearAllBlocks,
} from "../native/ScreenTime";

const AppLockContext = createContext();

const STORAGE_KEY = "@paypig_state_v2";

// Keychain key — persists across app reinstalls on iOS so the welcome bonus
// is only ever given once per device.
const WELCOME_BONUS_KEY = "scrollpig_welcome_bonus_claimed";
const WELCOME_BONUS_COINS = 50;

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
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "4 hours", minutes: 240 },
  { label: "8 hours", minutes: 480 },
  { label: "12 hours", minutes: 720 },
  { label: "24 hours", minutes: 1440 },
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
  isProPig: false,
  proPigSince: null,
  settings: {
    defaultPeekFee: 1,
    defaultFullFee: 10,
    defaultDuration: 60,   // minutes
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
      // Pro Pig: first peek per lock session is free
      const isFreePeek = state.isProPig && app.peekCount === 0;
      // Escalating: doubles each peek (1, 2, 4, 8, 16...)
      const cost = isFreePeek ? 0 : baseFee * Math.pow(2, app.peekCount);
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
            peekExpiresAt: Date.now() + 3 * 60 * 1000, // 3 minutes
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

    case "ACTIVATE_PRO_PIG": {
      return {
        ...state,
        isProPig: true,
        proPigSince: Date.now(),
      };
    }

    case "DEACTIVATE_PRO_PIG": {
      return {
        ...state,
        isProPig: false,
      };
    }

    case "SYNC_COINS_FROM_EXTENSION": {
      return {
        ...state,
        piggyCoins: action.payload.piggyCoins,
      };
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

        // Welcome bonus — 20 coins, once, on genuine first install. iOS only.
        // Only granted when there is NO existing saved state AND no keychain
        // flag. The keychain flag survives app reinstall on iOS, so users
        // can't farm the bonus by deleting and redownloading. Existing users
        // who already have a saved state don't get it either — the bonus is
        // strictly for brand new accounts.
        // Android's SecureStore backend doesn't persist past uninstall, so we
        // skip the bonus there until we have server-side dedup.
        if (Platform.OS === "ios" && !stored) {
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

        // Request Screen Time authorization on first launch
        if (isScreenTimeAvailable()) {
          try {
            const authStatus = await getAuthorizationStatus();
            if (authStatus.status === "notDetermined") {
              await requestAuthorization();
            }
          } catch (e) {
            console.warn("Screen Time auth request failed:", e);
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
        // Peek expired — close the peek window and re-block
        if (app.peekExpiresAt && now >= app.peekExpiresAt) {
          dispatch({ type: "PEEK_EXPIRED", payload: { appId } });
          if (isScreenTimeAvailable()) {
            blockSelectedApps().catch(() => {});
          }
        }
        // Lock timer expired naturally — only fire once per lock session
        if (app.lockedAt && app.lockExpiresAt && now >= app.lockExpiresAt && !app.peekExpiresAt) {
          if (!expiredLocksRef.current.has(appId)) {
            expiredLocksRef.current.add(appId);
            dispatch({ type: "LOCK_EXPIRED", payload: { appId } });
            if (isScreenTimeAvailable()) {
              clearAllBlocks().catch(() => {});
            }
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

  // Sync coin balance + fee settings to App Group so Shield extensions can read them
  useEffect(() => {
    if (isScreenTimeAvailable()) {
      syncToAppGroup(
        state.piggyCoins,
        state.settings.defaultPeekFee,
        state.settings.defaultFullFee
      ).catch(() => {});
    }
  }, [state.piggyCoins, state.settings.defaultPeekFee, state.settings.defaultFullFee]);

  // On app foreground, pull latest state from App Group (extensions may have deducted coins)
  useEffect(() => {
    if (!isScreenTimeAvailable()) return;
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        syncFromAppGroup().then((data) => {
          if (data && data.piggyCoins !== state.piggyCoins) {
            dispatch({ type: "SYNC_COINS_FROM_EXTENSION", payload: { piggyCoins: data.piggyCoins } });
          }
        }).catch(() => {});
      }
    });
    return () => sub.remove();
  }, [state.piggyCoins]);

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
