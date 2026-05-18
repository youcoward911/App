import { Linking } from "react-native";
import { showAlert } from "../components/CustomAlert";
import {
  isScreenTimeAvailable,
  requestAuthorization,
  getAuthorizationStatus,
  showAppPicker,
  blockSelectedApps,
  unblockApp,
  clearAllBlocks,
} from "../native/ScreenTime";

export async function ensureScreenTimeAuthorized() {
  if (!isScreenTimeAvailable()) {
    showAlert(
      "Not Available",
      "Screen Time blocking is only available in the full app build, not Expo Go.",
    );
    return false;
  }

  const status = await getAuthorizationStatus();

  if (status.status === "approved") return true;

  if (status.status === "denied") {
    showAlert(
      "Screen Time Access Required",
      "You previously denied Screen Time access. To lock apps for real, go to Settings > Screen Time > Scroll Pig and enable access.",
      [
        { text: "Open Settings", onPress: () => Linking.openSettings() },
        { text: "Cancel", style: "cancel" },
      ]
    );
    return false;
  }

  // notDetermined — request it
  try {
    const result = await requestAuthorization();
    if (result.status === "approved") return true;
  } catch (e) {
    // User denied or error
  }

  showAlert(
    "Access Denied",
    "Scroll Pig needs Screen Time access to actually block your apps. Without it, locks are just for show.",
    [{ text: "OK" }]
  );
  return false;
}

export async function lockAppsWithScreenTime() {
  const result = await showAppPicker();
  if (result.selectedCount > 0) {
    await blockSelectedApps();
  }
  return result;
}

export async function unlockAppWithScreenTime(appTokenString) {
  return unblockApp(appTokenString);
}

export async function clearAllScreenTimeBlocks() {
  return clearAllBlocks();
}
