import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppLockContext = createContext();

const STORAGE_KEY = "@paypig_state_v2";

export const COIN_PACKAGES = [
  { id: "small", productId: "scrollpiggy.coins.100", coins: 100, price: 9.99, label: "100 Coins", bonus: null },
  { id: "medium", productId: "scrollpiggy.coins.220", coins: 220, price: 19.99, label: "220 Coins", bonus: "+20 bonus" },
  { id: "large", productId: "scrollpiggy.coins.625", coins: 625, price: 49.99, label: "625 Coins", bonus: "+125 bonus" },
];

const initialState = {
  lockedApps: {},
  piggyCoins: 0,
  totalCoinsSpent: 0,
  totalCoinsPurchased: 0,
  totalMoneySpent: 0,
  totalUnlocks: 0,
  tributesToday: 0,
  tributesTodayDate: null,
  lastTributeTime: null,
  settings: {
    defaultFee: 5,
    timeLockMinutes: 0,
    currency: "USD",
    roastIntensity: "medium",
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_STATE":
      return { ...initialState, ...action.payload };

    case "LOCK_APP": {
      const { appId, unlockFee } = action.payload;
      return {
        ...state,
        lockedApps: {
          ...state.lockedApps,
          [appId]: {
            lockedAt: Date.now(),
            unlockFee: unlockFee ?? state.settings.defaultFee,
            unlockCountToday: state.lockedApps[appId]?.unlockCountToday ?? 0,
            lastUnlockDate: state.lockedApps[appId]?.lastUnlockDate ?? null,
          },
        },
      };
    }

    case "UNLOCK_APP": {
      const { appId } = action.payload;
      const app = state.lockedApps[appId];
      if (!app) return state;

      const fee = app.unlockFee || 0;
      const today = new Date().toDateString();
      const isNewDay = app.lastUnlockDate !== today;
      const newCount = isNewDay ? 1 : (app.unlockCountToday || 0) + 1;

      const isTodaySame = state.tributesTodayDate === today;

      const timeLock = state.settings.timeLockMinutes;
      const unlockExpiresAt = timeLock > 0 ? Date.now() + timeLock * 60 * 1000 : null;

      return {
        ...state,
        piggyCoins: Math.max(0, state.piggyCoins - fee),
        totalCoinsSpent: state.totalCoinsSpent + fee,
        totalUnlocks: state.totalUnlocks + 1,
        tributesToday: isTodaySame ? (state.tributesToday || 0) + 1 : 1,
        tributesTodayDate: today,
        lastTributeTime: Date.now(),
        lockedApps: {
          ...state.lockedApps,
          [appId]: {
            ...app,
            lockedAt: null,
            unlockCountToday: newCount,
            lastUnlockDate: today,
            unlockExpiresAt,
          },
        },
      };
    }

    case "RELOCK_APP": {
      const { appId } = action.payload;
      const app = state.lockedApps[appId];
      if (!app) return state;
      return {
        ...state,
        lockedApps: {
          ...state.lockedApps,
          [appId]: { ...app, lockedAt: Date.now() },
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

    case "UPDATE_SETTINGS": {
      const newSettings = { ...state.settings, ...action.payload };
      // If time lock turned off, clear expiry on all unlocked apps
      if (newSettings.timeLockMinutes === 0 && state.settings.timeLockMinutes > 0) {
        const updated = {};
        Object.entries(state.lockedApps).forEach(([id, app]) => {
          updated[id] = app.unlockExpiresAt ? { ...app, unlockExpiresAt: null } : app;
        });
        return { ...state, settings: newSettings, lockedApps: updated };
      }
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
        if (stored) {
          dispatch({ type: "LOAD_STATE", payload: JSON.parse(stored) });
        }
      } catch (e) {
        console.warn("Failed to load state:", e);
      }
    })();
  }, []);

  // Auto-relock expired apps
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      Object.entries(state.lockedApps).forEach(([appId, app]) => {
        if (!app.lockedAt && app.unlockExpiresAt && now >= app.unlockExpiresAt) {
          dispatch({ type: "RELOCK_APP", payload: { appId } });
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [state.lockedApps]);

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
