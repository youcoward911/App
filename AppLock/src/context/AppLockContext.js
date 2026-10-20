import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { requestPermissions, refreshNotifications, onTributePaid, scheduleLockExpiry, scheduleLockExpiryNotification, notifyPeekExpired, schedulePeekExpiryNotification, notifySurrender, cancelNagNotifications, scheduleWeeklyReport, cancelWeeklyReport } from "../utils/notifications";
import { trackAppOpen, trackUnlock } from "../utils/usageTracker";
import { updateLeaderboard } from "../utils/leaderboard";
import { syncUserToFirestore, loadUserFromFirestore, shouldSync } from "../utils/userSync";
import { logEvent } from "../utils/analytics";
import { getLevel } from "../utils/pigWeight";
import { getPeekCost } from "../utils/peekPricing";
import {
  syncToAppGroup,
  isScreenTimeAvailable,
  requestAuthorization,
  getAuthorizationStatus,
  showAppPicker,
  blockSelectedApps,
  blockLists as blockListsNative,
  unblockApp,
  clearAllBlocks,
  setLockState as setLockStateNative,
  consumeShieldEvents,
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
    { id: "default", name: "Slop List", appCount: 0, isActive: true },
  ],
  schedules: [],
  piggyCoins: 0, // new players get WELCOME_BONUS_COINS once per device
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
  activeSkin: "default",
  // Highest level whose level-up screen has been shown
  levelCelebrated: 1,
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
      { id: "default", name: "Slop List", appCount, isActive: true },
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
      // Merge settings per field so keys added in newer versions get their defaults
      return {
        ...initialState,
        ...migrated,
        settings: { ...initialState.settings, ...migrated.settings },
        // Saves from before levelCelebrated existed: treat the current level as already shown
        levelCelebrated: migrated.levelCelebrated ?? getLevel(migrated.totalCoinsSpent || 0).level,
      };
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

      const cost = getPeekCost(lock.peekCount || 0, lock.fullFee || state.settings.defaultFullFee, state.isProPig);
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
      // A peeked lock doesn't count toward the streak (the peek already reset it to 0)
      const newStreak = wasPeeked ? 0 : (state.ironSnoutStreak || 0) + 1;
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
      const targetId = action.payload.listId || "default";
      const count = action.payload.count;
      const updatedLists = (state.blockLists || []).map((l) =>
        // rev bumps on every picker save so native icon views remount and reload the selection
        l.id === targetId ? { ...l, appCount: count, rev: (l.rev || 0) + 1 } : l
      );
      const totalActive = updatedLists.filter((l) => l.isActive).reduce((s, l) => s + l.appCount, 0);
      return {
        ...state,
        slopLock: {
          ...state.slopLock,
          appCount: totalActive,
        },
        blockLists: updatedLists,
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

    case "SHIELD_EVENT": {
      // Peek/unlock paid on the iOS block screen. The extension already took the coins
      // from the App Group balance; mirror that here and count it like an in-app payment.
      const { type, cost = 0, at = Date.now() } = action.payload;
      const day = new Date(at).toDateString();
      const isTodaySame = state.tributesTodayDate === day;
      const lock = state.slopLock;
      const paid = {
        ...state,
        piggyCoins: Math.max(0, state.piggyCoins - cost),
        totalCoinsSpent: state.totalCoinsSpent + cost,
        totalUnlocks: state.totalUnlocks + 1,
        tributesToday: isTodaySame ? (state.tributesToday || 0) + 1 : 1,
        tributesTodayDate: day,
        lastTributeTime: at,
        ironSnoutStreak: 0,
      };
      if (type === "peek") {
        return {
          ...paid,
          totalPeeks: (state.totalPeeks || 0) + 1,
          slopLock: lock.isLocked
            ? { ...lock, peekCount: lock.peekCount + 1, peekExpiresAt: Math.max(lock.peekExpiresAt || 0, at + 2 * 60 * 1000) }
            : lock,
        };
      }
      return {
        ...paid,
        totalSurrenders: (state.totalSurrenders || 0) + 1,
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

    case "SYNC_COINS_FROM_EXTENSION": {
      return {
        ...state,
        piggyCoins: action.payload.piggyCoins,
      };
    }

    case "LEVEL_CELEBRATED": {
      return { ...state, levelCelebrated: Math.max(state.levelCelebrated || 1, action.payload) };
    }

    case "SET_SKIN": {
      return { ...state, activeSkin: action.payload };
    }

    case "ADD_COINS": {
      return { ...state, piggyCoins: state.piggyCoins + (action.payload.coins || 0) };
    }

    case "PAY_TRIBUTE": {
      const fee = action.payload.fee || 10;
      if (state.piggyCoins < fee) return state;
      const today = new Date().toDateString();
      const isTodaySame = state.tributesTodayDate === today;
      return {
        ...state,
        piggyCoins: state.piggyCoins - fee,
        totalCoinsSpent: state.totalCoinsSpent + fee,
        totalUnlocks: state.totalUnlocks + 1,
        tributesToday: isTodaySame ? (state.tributesToday || 0) + 1 : 1,
        tributesTodayDate: today,
        lastTributeTime: Date.now(),
      };
    }

    default:
      return state;
  }
}

export function AppLockProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateLoaded = useRef(false);
  // Mirrors stateLoaded so the App Group sync effects also run once loading finishes,
  // even when the loaded state didn't change their deps (e.g. a fresh install)
  const [loaded, setLoaded] = useState(false);

  const applyShieldEvents = async () => {
    if (!isScreenTimeAvailable()) return;
    try {
      const events = await consumeShieldEvents();
      (events || []).forEach((e) => {
        dispatch({ type: "SHIELD_EVENT", payload: e });
        trackUnlock("blockscreen", e.cost || 0, null, {
          kind: e.type === "peek" ? "peek" : "surrender",
          time: e.at,
        }).catch(() => {});
      });
    } catch (e) {}
  };

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.removeItem("@paypig_state");
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        await requestPermissions();
        try {
          await cancelNagNotifications();
        } catch (e) {}
        if (stored) {
          const parsed = JSON.parse(stored);
          dispatch({ type: "LOAD_STATE", payload: parsed });
          stateLoaded.current = true;
          await refreshNotifications(parsed.lastTributeTime);
        } else {
          stateLoaded.current = true;
        }
        setLoaded(true);
        await applyShieldEvents();

        if (!stored) {
          // Fresh install — try restoring from Firestore (returning user)
          let restored = false;
          try {
            const cloudData = await loadUserFromFirestore();
            if (cloudData) {
              dispatch({ type: "LOAD_STATE", payload: cloudData });
              restored = true;
            }
          } catch (e) {
            console.warn("Firestore restore failed:", e);
          }

          // Grant the welcome bonus only if no cloud restore happened. The iOS
          // Keychain survives uninstall, so reinstalling doesn't grant it again
          // (Android's SecureStore doesn't persist past uninstall).
          if (!restored) {
            let alreadyClaimed = false;
            try {
              alreadyClaimed = !!(await SecureStore.getItemAsync(WELCOME_BONUS_KEY));
            } catch (e) {}
            if (!alreadyClaimed) {
              dispatch({ type: "WELCOME_BONUS" });
              try {
                await SecureStore.setItemAsync(WELCOME_BONUS_KEY, "1");
              } catch (e) {}
            }
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
        notifyPeekExpired().catch(() => {});
        if (isScreenTimeAvailable()) {
          const activeIds = lock.activeListIds || ["default"];
          blockListsNative(activeIds).then((r) => {
            if (!r || r.blockedCount === 0) blockSelectedApps().catch(() => {});
          }).catch(() => blockSelectedApps().catch(() => {}));
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
      scheduleLockExpiryNotification("Slop List", lock.lockExpiresAt).catch(() => {});
    }
  }, [state.slopLock.lockExpiresAt]);

  // Reschedule push notifications + update leaderboard when a tribute is paid
  useEffect(() => {
    if (state.lastTributeTime) {
      onTributePaid().catch(() => {});
      updateLeaderboard(state.totalCoinsSpent, state.totalUnlocks, state.totalSurrenders || 0).catch(() => {});
    }
  }, [state.lastTributeTime]);

  useEffect(() => {
    if (!stateLoaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.warn("Failed to save state:", e)
    );
  }, [state]);

  // Sync coin balance + fee settings to App Group
  useEffect(() => {
    if (stateLoaded.current && isScreenTimeAvailable()) {
      syncToAppGroup(
        state.piggyCoins,
        state.settings.defaultPeekFee,
        state.settings.defaultFullFee
      ).catch(() => {});
    }
  }, [loaded, state.piggyCoins, state.settings.defaultPeekFee, state.settings.defaultFullFee]);

  // Weekly Shame Report notification is a Pro perk
  useEffect(() => {
    if (!loaded) return;
    (state.isProPig ? scheduleWeeklyReport() : cancelWeeklyReport()).catch(() => {});
  }, [loaded, state.isProPig]);

  // On app foreground, count any peeks/unlocks paid on the block screen
  useEffect(() => {
    if (!isScreenTimeAvailable()) return;
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && stateLoaded.current) applyShieldEvents();
    });
    return () => sub.remove();
  }, []);

  // Mirror the lock to the App Group so the block screen can price peeks and the
  // monitor extension can re-block after a peek / unblock when the lock ends
  useEffect(() => {
    if (!stateLoaded.current || !isScreenTimeAvailable()) return;
    const lock = state.slopLock;
    setLockStateNative({
      isLocked: !!lock.isLocked,
      lockExpiresAt: lock.lockExpiresAt || 0,
      peekCount: lock.peekCount || 0,
      peekFee: lock.peekFee || state.settings.defaultPeekFee,
      fullFee: lock.fullFee || state.settings.defaultFullFee,
      listIds: lock.activeListIds || ["default"],
      isPro: !!state.isProPig,
    }).catch(() => {});
  }, [loaded, state.slopLock.isLocked, state.slopLock.lockExpiresAt, state.slopLock.peekCount, state.isProPig]);

  // Debounced Firestore sync — backs up meaningful state changes
  const prevSyncState = useRef(state);
  useEffect(() => {
    if (!stateLoaded.current) return;
    if (!shouldSync(prevSyncState.current, state)) return;
    const timer = setTimeout(() => {
      prevSyncState.current = state;
      syncUserToFirestore(state).catch((e) => console.warn("Firestore sync failed:", e));
    }, 5000);
    return () => clearTimeout(timer);
  }, [state]);

  // Analytics: log key events
  useEffect(() => {
    if (!stateLoaded.current) return;
    if (state.lastTributeTime) {
      logEvent("tribute_paid", { coins: state.totalCoinsSpent });
    }
  }, [state.lastTributeTime]);

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
