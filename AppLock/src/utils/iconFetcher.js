import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "@app_icon_cache";
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

let iconCache = {};
let cacheLoaded = false;

async function loadCache() {
  if (cacheLoaded) return;
  try {
    const stored = await AsyncStorage.getItem(CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only use if not expired
      if (parsed._timestamp && Date.now() - parsed._timestamp < CACHE_EXPIRY) {
        iconCache = parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  cacheLoaded = true;
}

async function saveCache() {
  try {
    iconCache._timestamp = Date.now();
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(iconCache));
  } catch (e) {
    // ignore
  }
}

// Fetch icon URL from Apple's public iTunes Search API
export async function fetchAppIcon(appName, bundleId) {
  await loadCache();

  const cacheKey = bundleId || appName;
  if (iconCache[cacheKey]) return iconCache[cacheKey];

  try {
    let iconUrl = null;

    // Try bundle ID lookup first
    if (bundleId) {
      const res = await fetch(
        `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(bundleId)}&country=us`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        iconUrl = data.results[0].artworkUrl512 || data.results[0].artworkUrl100;
      }
    }

    // Fall back to name search if bundleId returned nothing
    if (!iconUrl) {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&country=us&entity=software&limit=1`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        iconUrl = data.results[0].artworkUrl512 || data.results[0].artworkUrl100;
      }
    }

    if (iconUrl) {
      iconCache[cacheKey] = iconUrl;
      saveCache();
      return iconUrl;
    }
  } catch (e) {
    // Network error — return null, fallback to letter icon
  }

  return null;
}

// Batch fetch icons for multiple apps
export async function fetchAllAppIcons(apps) {
  await loadCache();

  const uncached = apps.filter((app) => {
    const key = app.bundleId || app.name;
    return !iconCache[key];
  });

  // Fetch uncached icons in parallel (max 5 at a time)
  const batchSize = 5;
  for (let i = 0; i < uncached.length; i += batchSize) {
    const batch = uncached.slice(i, i + batchSize);
    await Promise.all(
      batch.map((app) => fetchAppIcon(app.name, app.bundleId))
    );
  }

  // Return map of app id -> icon URL
  const result = {};
  apps.forEach((app) => {
    const key = app.bundleId || app.name;
    result[app.id] = iconCache[key] || null;
  });
  return result;
}

// Get cached icon URL (sync, for render)
export function getCachedIcon(appName, bundleId) {
  const key = bundleId || appName;
  return iconCache[key] || null;
}

// Prefetch image into RN image cache
export function prefetchIcon(url) {
  if (url) Image.prefetch(url);
}
