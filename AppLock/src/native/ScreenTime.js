import { NativeModules, Platform } from "react-native";

const { ScreenTimeModule } = NativeModules;

// Check if the native module is available (only on iOS dev build, not Expo Go)
const isAvailable = Platform.OS === "ios" && ScreenTimeModule != null;

/**
 * Request Screen Time authorization from the user.
 * Shows Apple's native permission dialog.
 * Must be called before any blocking functions.
 */
export async function requestAuthorization() {
  if (!isAvailable) {
    console.warn("ScreenTime module not available — running in Expo Go or Android");
    return { status: "unavailable" };
  }
  return ScreenTimeModule.requestAuthorization();
}

/**
 * Check if Screen Time is authorized.
 * Returns: "notDetermined" | "approved" | "denied" | "unavailable"
 */
export async function getAuthorizationStatus() {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.getAuthorizationStatus();
}

/**
 * Show Apple's native app picker so the user can select apps to lock.
 * Returns the number of apps/categories selected.
 * The picker shows real app icons — Apple handles privacy, we only get opaque tokens.
 */
export async function showAppPicker() {
  if (!isAvailable) {
    console.warn("ScreenTime module not available");
    return { selectedCount: 0 };
  }
  return ScreenTimeModule.showAppPicker();
}

/**
 * Block all apps the user selected in the picker.
 * Applies a system-level shield overlay — they literally cannot use the app.
 */
export async function blockSelectedApps() {
  if (!isAvailable) return { blockedCount: 0 };
  return ScreenTimeModule.blockSelectedApps();
}

/**
 * Temporarily unblock an app (when user pays coins).
 * In v1, this unblocks all apps briefly. Future: per-app unblock via token mapping.
 */
export async function unblockApp(appTokenString) {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.unblockApp(appTokenString);
}

/**
 * Re-block all selected apps (when user relocks).
 */
export async function reblockAllApps() {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.reblockAllApps();
}

/**
 * Clear all blocks and reset.
 */
export async function clearAllBlocks() {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.clearAllBlocks();
}

/**
 * Check if the native module is loaded (false in Expo Go).
 */
export function isScreenTimeAvailable() {
  return isAvailable;
}
