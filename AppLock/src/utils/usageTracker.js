import AsyncStorage from "@react-native-async-storage/async-storage";

const USAGE_KEY = "@scrollpiggy_usage_v2";
const OLD_USAGE_KEY = "@scrollpiggy_usage_v1";

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
    // Clear stale v1 data
    await AsyncStorage.removeItem(OLD_USAGE_KEY).catch(() => {});
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
  if (data.unlockLog.length > 200) {
    data.unlockLog = data.unlockLog.slice(-200);
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

// Get top N apps by coins spent over a time period
// period: "today" or "week"
export async function getTopAppsBySpend(period = "today", limit = 5) {
  const data = await loadUsage();
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let cutoff;
  if (period === "week") {
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    cutoff = startOfWeek.getTime();
  } else {
    cutoff = startOfToday.getTime();
  }

  const appStats = {};
  for (const entry of data.unlockLog) {
    if (entry.time >= cutoff) {
      if (!appStats[entry.appId]) {
        appStats[entry.appId] = { unlocks: 0, spent: 0 };
      }
      appStats[entry.appId].unlocks++;
      appStats[entry.appId].spent += entry.fee || 0;
    }
  }

  return Object.entries(appStats)
    .map(([appId, stats]) => ({ appId, ...stats }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, limit);
}

// Get weekly usage report data
export async function getWeeklyReport() {
  const data = await loadUsage();
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const weekLog = data.unlockLog.filter((e) => e.time >= weekAgo);
  const totalUnlocks = weekLog.length;
  const totalSpent = weekLog.reduce((sum, e) => sum + (e.fee || 0), 0);

  // Per-day breakdown
  const days = {};
  for (const entry of weekLog) {
    const day = new Date(entry.time).toLocaleDateString("en-US", { weekday: "short" });
    if (!days[day]) days[day] = { unlocks: 0, spent: 0 };
    days[day].unlocks++;
    days[day].spent += entry.fee || 0;
  }

  // Top app
  const appStats = {};
  for (const entry of weekLog) {
    if (!appStats[entry.appId]) appStats[entry.appId] = { unlocks: 0, spent: 0 };
    appStats[entry.appId].unlocks++;
    appStats[entry.appId].spent += entry.fee || 0;
  }
  const topApp = Object.entries(appStats)
    .sort((a, b) => b[1].spent - a[1].spent)
    .map(([appId, stats]) => ({ appId, ...stats }))[0] || null;

  // Avg unlocks per day
  const activeDays = Object.keys(days).length || 1;
  const avgPerDay = Math.round(totalUnlocks / activeDays * 10) / 10;

  // Peak hour this week
  const hourCounts = {};
  for (const entry of weekLog) {
    const h = new Date(entry.time).getHours();
    hourCounts[h] = (hourCounts[h] || 0) + 1;
  }
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  let peakHourLabel = null;
  if (peakHour) {
    const h = parseInt(peakHour[0]);
    const period = h >= 12 ? "PM" : "AM";
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    peakHourLabel = `${display} ${period}`;
  }

  return {
    totalUnlocks,
    totalSpent,
    days,
    topApp,
    avgPerDay,
    peakHour: peakHourLabel,
    peakHourCount: peakHour ? parseInt(peakHour[1]) : 0,
  };
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
