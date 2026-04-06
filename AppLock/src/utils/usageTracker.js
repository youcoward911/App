import AsyncStorage from "@react-native-async-storage/async-storage";

const USAGE_KEY = "@scrollpiggy_usage_v1";

// Default usage data structure
const DEFAULT_USAGE = {
  totalOpens: 0,           // How many times user opened the app
  totalUnlocks: 0,         // Total tributes paid
  totalCoinsSpent: 0,      // Lifetime coins spent
  appUnlocks: {},          // Per-app unlock counts: { instagram: 12, tiktok: 8 }
  hourlyUnlocks: {},       // Unlocks by hour: { "9": 3, "14": 7, "22": 12 }
  dailyUnlocks: {},        // Unlocks by day of week: { "Mon": 5, "Tue": 8 }
  streakDays: 0,           // Current streak (days with at least one unlock)
  longestStreak: 0,        // Longest streak ever
  fastestCave: Infinity,   // Fastest time (seconds) from lock to unlock
  averageCaveTime: 0,      // Average seconds from lock to unlock
  caveTimeSamples: 0,      // Number of samples for average
  lastOpenTime: null,       // Last time the app was opened
  dailyOpenCounts: {},     // Opens per date: { "2026-04-06": 5 }
  unlockLog: [],           // Recent unlock log (last 50): [{ appId, time, fee, caveSeconds }]
};

let usageData = null;

async function loadUsage() {
  if (usageData) return usageData;
  try {
    const stored = await AsyncStorage.getItem(USAGE_KEY);
    usageData = stored ? { ...DEFAULT_USAGE, ...JSON.parse(stored) } : { ...DEFAULT_USAGE };
  } catch (e) {
    usageData = { ...DEFAULT_USAGE };
  }
  return usageData;
}

async function saveUsage() {
  if (!usageData) return;
  try {
    await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usageData));
  } catch (e) {
    // ignore
  }
}

// Call when the app is opened
export async function trackAppOpen() {
  const data = await loadUsage();
  data.totalOpens++;
  data.lastOpenTime = Date.now();

  const today = new Date().toISOString().slice(0, 10);
  data.dailyOpenCounts[today] = (data.dailyOpenCounts[today] || 0) + 1;

  // Clean old daily counts (keep last 30 days)
  const keys = Object.keys(data.dailyOpenCounts).sort();
  if (keys.length > 30) {
    keys.slice(0, keys.length - 30).forEach((k) => delete data.dailyOpenCounts[k]);
  }

  await saveUsage();
  return data;
}

// Call when user pays tribute to unlock an app
export async function trackUnlock(appId, fee, lockedAt) {
  const data = await loadUsage();
  const now = Date.now();

  data.totalUnlocks++;
  data.totalCoinsSpent += fee;

  // Per-app tracking
  data.appUnlocks[appId] = (data.appUnlocks[appId] || 0) + 1;

  // Hourly pattern
  const hour = new Date().getHours().toString();
  data.hourlyUnlocks[hour] = (data.hourlyUnlocks[hour] || 0) + 1;

  // Day of week pattern
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = days[new Date().getDay()];
  data.dailyUnlocks[day] = (data.dailyUnlocks[day] || 0) + 1;

  // Cave time (how fast they gave in)
  if (lockedAt) {
    const caveSeconds = Math.floor((now - lockedAt) / 1000);
    if (caveSeconds < data.fastestCave || data.fastestCave === Infinity) {
      data.fastestCave = caveSeconds;
    }
    // Running average
    const total = data.averageCaveTime * data.caveTimeSamples + caveSeconds;
    data.caveTimeSamples++;
    data.averageCaveTime = Math.floor(total / data.caveTimeSamples);
  }

  // Unlock log (keep last 50)
  data.unlockLog.push({
    appId,
    time: now,
    fee,
    caveSeconds: lockedAt ? Math.floor((now - lockedAt) / 1000) : null,
  });
  if (data.unlockLog.length > 50) {
    data.unlockLog = data.unlockLog.slice(-50);
  }

  // Streak tracking
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (data.dailyOpenCounts[yesterday] || data.dailyOpenCounts[today]) {
    data.streakDays = (data.streakDays || 0) + (data._lastStreakDate === today ? 0 : 1);
    data._lastStreakDate = today;
    if (data.streakDays > data.longestStreak) {
      data.longestStreak = data.streakDays;
    }
  }

  await saveUsage();
  return data;
}

// Get the user's most unlocked app
export async function getWeakestApp() {
  const data = await loadUsage();
  const entries = Object.entries(data.appUnlocks);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { appId: entries[0][0], count: entries[0][1] };
}

// Get their peak usage hour
export async function getPeakHour() {
  const data = await loadUsage();
  const entries = Object.entries(data.hourlyUnlocks);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  const hour = parseInt(entries[0][0]);
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return { hour, display: `${display} ${period}`, count: entries[0][1] };
}

// Get their weakest day of the week
export async function getWeakestDay() {
  const data = await loadUsage();
  const entries = Object.entries(data.dailyUnlocks);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { day: entries[0][0], count: entries[0][1] };
}

// Get today's stats
export async function getTodayStats() {
  const data = await loadUsage();
  const today = new Date().toISOString().slice(0, 10);
  return {
    opens: data.dailyOpenCounts[today] || 0,
    totalOpens: data.totalOpens,
    totalUnlocks: data.totalUnlocks,
    totalCoinsSpent: data.totalCoinsSpent,
    fastestCave: data.fastestCave === Infinity ? null : data.fastestCave,
    averageCaveTime: data.averageCaveTime,
    streakDays: data.streakDays,
    longestStreak: data.longestStreak,
  };
}

// Get all usage data (for stats screen)
export async function getFullUsage() {
  return await loadUsage();
}

// Format seconds into readable string
export function formatCaveTime(seconds) {
  if (!seconds || seconds === Infinity) return "N/A";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ${seconds % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
