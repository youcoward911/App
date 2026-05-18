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
  blockLists as blockListsNative,
  unblockApp,
  clearAllBlocks,
} from "../native/ScreenTime";

const AppLockContext = createContext();

const STORAGE_KEY = "@paypig_state_v2";

const WELCOME_BONUS_KEY = "scrollpig_welcome_bonus_claimed";
const WELCOME_BONUS_COINS = 50;

export const COIN_PACKAGES = [
  { id: "small", productId: "scrollpiggy.coins.50", coins: 50, price: 4.99, label: "50 Coins", bonus: null },
  { id: "medium", productId: "scrollpiggy.coins.120", coins: 120, price: 9.99, label: "120 Coins", bonus: "+20 bonus" },
  { id: "large", productId: "scrollpiggy.coins.250", coins: 250, price: 19.99, label: "250 Coins", bonus: "+50 bonus" },
];

export const FEE_TIERS = [
  { label: "1 / 10", peek: 1, full: 10 },
  { label: "2 / 20", peek: 2, full: 20 },
  { label: "3 / 30", peek: 3, full: 30 },
  { label: "4 / 40", peek: 4, full: 40 },
];

export const DURATION_PRESETS = [
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "4 hours", minutes: 240 },
  { label: "8 hours", minutes: 480 },
  { label: "12 hours", minutes: 720 },
  { label: "24 hours", minutes: 1440 },
];

const initialState = {
  slopLock: {
    isLocked: false,
    lockedAt: null,
    lockExpiresAt: null,
    durationMinutes: null,
    peekFee: null,
    fullFee: null,
    peekCount: 0,
    peekExpiresAt: null,
    appCount: 0,
    activeListIds: ["default"],
  },
  blockLists: [
    { id: "default", name: "Slop Lock", appCount: 0, isActive: true },
  ],
  schedules: [],
  piggyCoins: 50,
  totalCoinsSpent: 0,
  totalCoinsPurchased: 0,
  totalMoneySpent: 0,
  totalUnlocks: 0,
  totalPeeks: 0,
  totalSurrenders: 0,
  tributesToday: 0,
  tributesTodayDate: null,
  lastTributeTime: null,
  ironSnoutStreak: 0,
  bestIronSnout: 0,
  isProPig: false,
  proPigSince: null,
  settings: {
    defaultPeekFee: 1,
    defaultFullFee: 10,
    defaultDuration: 60,
    currency: "USD",
    roastIntensity: "medium",
  },
};

function migrateState(payload) {
  const migrated = { ...payload };

  // Migrate old per-app lockedApps to slopLock
  if (migrated.lockedApps && !migrated.slopLock) {
    const apps = Object.values(migrated.lockedApps);
    const activeLock = apps.find((a) => a.lockedAt && a.lockExpiresAt && a.lockExpiresAt > Date.now());
    delete migrated.lockedApps;
    if (activeLock) {
      migrated.slopLock = {
        isLocked: true,
        lockedAt: activeLock.lockedAt,
        lockExpiresAt: activeLock.lockExpiresAt,
        durationMinutes: activeLock.durationMinutes,
        peekFee: activeLock.peekFee,
        fullFee: activeLock.fullFee,
        peekCount: activeLock.peekCount || 0,
        peekExpiresAt: activeLock.peekExpiresAt || null,
        appCount: Object.keys(payload.lockedApps).length,
        activeListIds: ["default"],
      };
    }
  }

  // Ensure blockLists exists
  if (!migrated.blockLists) {
    const appCount = migrated.slopLock?.appCount || 0;
    migrated.blockLists = [
      { id: "default", name: "Slop Lock", appCount, isActive: true },
    ];
  }

  // Ensure schedules exists
  if (!migrated.schedules) {
    migrated.schedules = [];
  }

  return migrated;
}

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_STATE": {
      const migrated = migrateState(action.payload);
      return { ...initialState, ...migrated };
    }

    case "LOCK_SLOP": {
      const { durationMinutes } = action.payload;
      const dur = durationMinutes ?? state.settings.defaultDuration;
      const activeIds = state.blockLists.filter((l) => l.isActive).map((l) => l.id);
      const totalApps = state.blockLists.filter((l) => l.isActive).reduce((s, l) => s + l.appCount, 0);
      return {
        ...state,
        slopLock: {
          ...state.slopLock,
          isLocked: true,
          lockedAt: Date.now(),
          lockExpiresAt: Date.now() + dur * 60 * 1000,
          durationMinutes: dur,
          peekFee: state.settings.defaultPeekFee,
          fullFee: state.settings.defaultFullFee,
          peekCount: 0,
          peekExpiresAt: null,
          activeListIds: activeIds,
          appCount: totalApps,
        },
      };
    }

    case "PEEK_SLOP": {
      const lock = state.slopLock;
      if (!lock.isLocked) return state;

      const baseFee = lock.peekFee || 1;
      const isFreePeek = state.isProPig && lock.peekCount === 0;
      const cost = isFreePeek ? 0 : baseFee * Math.pow(2, lock.peekCount);
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
        ironSnoutStreak: 0,
        slopLock: {
          ...lock,
          peekCount: lock.peekCount + 1,
          peekExpiresAt: Date.now() + 2 * 60 * 1000,
        },
      };
    }

    case "UNLOCK_SLOP": {
      const lock = state.slopLock;
      if (!lock.isLocked) return state;

      const fee = lock.fullFee || 10;
      const today = new Date().toDateString();
      const isTodaySame = state.tributesTodayDate === today;

      return {
        ...state,
        piggyCoins: Math.max(0, state.piggyCoins - fee),
        totalCoinsSpent: state.totalCoinsSpent + fee,
        totalUnlocks: state.totalUnlocks + 1,
        totalSurrenders: (state.totalSurrenders || 0) + 1,
        tributesToday: isTodaySame ? (state.tributesToday || 0) + 1 : 1,
        tributesTodayDate: today,
        lastTributeTime: Date.now(),
        ironSnoutStreak: 0,
        slopLock: {
          ...lock,
          isLocked: false,
          lockedAt: null,
          lockExpiresAt: null,
          peekExpiresAt: null,
          peekCount: 0,
        },
      };
    }

    case "SLOP_LOCK_EXPIRED": {
      const lock = state.slopLock;
      const wasPeeked = lock.peekCount > 0;
      const newStreak = wasPeeked ? 1 : (state.ironSnoutStreak || 0) + 1;
      const best = Math.max(state.bestIronSnout || 0, newStreak);

      return {
        ...state,
        ironSnoutStreak: newStreak,
        bestIronSnout: best,
        slopLock: {
          ...lock,
          isLocked: false,
          lockedAt: null,
          lockExpiresAt: null,
          peekExpiresAt: null,
          peekCount: 0,
        },
      };
    }

    case "SLOP_PEEK_EXPIRED": {
      return {
        ...state,
        slopLock: {
          ...state.slopLock,
          peekExpiresAt: null,
        },
      };
    }

    case "SET_APP_COUNT": {
      const { listId, count } = action.payload;
      return {
        ...state,
        slopLock: {
          ...state.slopLock,
          appCount: state.blockLists.filter((l) => l.isActive).reduce((sum, l) => {
            if (listId && l.id === listId) return sum + count;
            return sum + l.appCount;
          }, 0),
        },
        blockLists: state.blockLists.map((l) =>
          l.id === (listId || "default") ? { ...l, appCount: count } : l
        ),
      };
    }

    case "ADD_BLOCK_LIST": {
      const { id, name } = action.payload;
      return {
        ...state,
        blockLists: [...state.blockLists, { id, name, appCount: 0, isActive: true }],
      };
    }

    case "UPDATE_BLOCK_LIST": {
      return {
        ...state,
        blockLists: state.blockLists.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload } : l
        ),
      };
    }

    case "DELETE_BLOCK_LIST": {
      if (state.blockLists.length <= 1) return state;
      return {
        ...state,
        blockLists: state.blockLists.filter((l) => l.id !== action.payload.id),
      };
    }

    case "TOGGLE_BLOCK_LIST": {
      return {
        ...state,
        blockLists: state.blockLists.map((l) =>
          l.id === action.payload.id ? { ...l, isActive: !l.isActive } : l
        ),
      };
    }

    case "ADD_SCHEDULE": {
      return {
        ...state,
        schedules: [...state.schedules, action.payload],
      };
    }

    case "UPDATE_SCHEDULE": {
      return {
        ...state,
        schedules: state.schedules.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
      };
    }

    case "DELETE_SCHEDULE": {
      return {
        ...state,
        schedules: state.schedules.filter((s) => s.id !== action.payload.id),
      };
    }

    case "TOGGLE_SCHEDULE": {
      return {
        ...state,
        schedules: state.schedules.map((s) =>
          s.id === action.payload.id ? { ...s, isEnabled: !s.isEnabled } : s
        ),
      };
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
        await AsyncStorage.removeItem("@paypig_state");
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        await requestPermissions();
        try {
          const Notifs = require("expo-notifications");
          await Notifs.cancelAllScheduledNotificationsAsync();
        } catch (e) {}
        if (stored) {
          const parsed = JSON.parse(stored);
          dispatch({ type: "LOAD_STATE", payload: parsed });
          await refreshNotifications(parsed.lastTributeTime);
        }

        if (!stored) {
          // Fresh install — grant welcome bonus
          dispatch({ type: "WELCOME_BONUS" });
          if (Platform.OS === "ios") {
            try {
              await SecureStore.setItemAsync(WELCOME_BONUS_KEY, "1");
            } catch (e) {}
          }
        }

        await trackAppOpen();
      } catch (e) {
        console.warn("Failed to load state:", e);
      }
    })();
  }, []);

  // Timer checks: slop lock expiry, peek expiry
  const expiredRef = useRef(false);
  useEffect(() => {
    const lock = state.slopLock;
    if (!lock.isLocked) {
      expiredRef.current = false;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      // Peek expired — close peek window and re-block
      if (lock.peekExpiresAt && now >= lock.peekExpiresAt) {
        dispatch({ type: "SLOP_PEEK_EXPIRED" });
        if (isScreenTimeAvailable()) {
          const activeIds = lock.activeListIds || ["default"];
          blockListsNative(activeIds).catch(() => {});
        }
      }
      // Lock timer expired naturally
      if (lock.lockExpiresAt && now >= lock.lockExpiresAt && !lock.peekExpiresAt) {
        if (!expiredRef.current) {
          expiredRef.current = true;
          dispatch({ type: "SLOP_LOCK_EXPIRED" });
          if (isScreenTimeAvailable()) {
            clearAllBlocks().catch(() => {});
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state.slopLock]);

  // Schedule lock expiry notification
  const prevLockExpiresRef = useRef(null);
  useEffect(() => {
    const lock = state.slopLock;
    if (lock.isLocked && lock.lockExpiresAt && lock.lockExpiresAt !== prevLockExpiresRef.current) {
      prevLockExpiresRef.current = lock.lockExpiresAt;
      scheduleLockExpiryNotification("Slop Lock", lock.lockExpiresAt).catch(() => {});
    }
  }, [state.slopLock.lockExpiresAt]);

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

  // Sync coin balance + fee settings to App Group
  useEffect(() => {
    if (isScreenTimeAvailable()) {
      syncToAppGroup(
        state.piggyCoins,
        state.settings.defaultPeekFee,
        state.settings.defaultFullFee
      ).catch(() => {});
    }
  }, [state.piggyCoins, state.settings.defaultPeekFee, state.settings.defaultFullFee]);

  // On app foreground, pull latest state from App Group
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
