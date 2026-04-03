import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppLockContext = createContext();

const STORAGE_KEY = "@paypig_state";

const initialState = {
  lockedApps: {},
  // { [appId]: { lockedAt: timestamp, unlockFee: number, unlockCountToday: number, lastUnlockDate: string } }
  totalSpent: 0,
  totalUnlocks: 0,
  settings: {
    defaultFee: 0.5,
    currency: "USD",
    roastIntensity: "medium", // 'mild', 'medium', 'savage'
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
            unlockCountToday:
              state.lockedApps[appId]?.unlockCountToday ?? 0,
            lastUnlockDate:
              state.lockedApps[appId]?.lastUnlockDate ?? null,
          },
        },
      };
    }

    case "UNLOCK_APP": {
      const { appId } = action.payload;
      const app = state.lockedApps[appId];
      if (!app) return state;

      const today = new Date().toDateString();
      const isNewDay = app.lastUnlockDate !== today;
      const newCount = isNewDay ? 1 : (app.unlockCountToday || 0) + 1;

      return {
        ...state,
        lockedApps: {
          ...state.lockedApps,
          [appId]: {
            ...app,
            lockedAt: null, // Temporarily unlocked
            unlockCountToday: newCount,
            lastUnlockDate: today,
          },
        },
        totalSpent: state.totalSpent + (app.unlockFee || 0),
        totalUnlocks: state.totalUnlocks + 1,
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
          [appId]: {
            ...app,
            lockedAt: Date.now(),
          },
        },
      };
    }

    case "REMOVE_APP": {
      const newLocked = { ...state.lockedApps };
      delete newLocked[action.payload.appId];
      return { ...state, lockedApps: newLocked };
    }

    case "UPDATE_FEE": {
      const { appId, fee } = action.payload;
      const app = state.lockedApps[appId];
      if (!app) return state;
      return {
        ...state,
        lockedApps: {
          ...state.lockedApps,
          [appId]: { ...app, unlockFee: fee },
        },
      };
    }

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    default:
      return state;
  }
}

export function AppLockProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          dispatch({ type: "LOAD_STATE", payload: JSON.parse(stored) });
        }
      } catch (e) {
        console.warn("Failed to load state:", e);
      }
    })();
  }, []);

  // Persist state on changes
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
  if (!context) {
    throw new Error("useAppLock must be used within AppLockProvider");
  }
  return context;
}
