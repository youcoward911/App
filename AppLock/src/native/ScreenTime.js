import { NativeModules, Platform } from "react-native";

const { ScreenTimeModule } = NativeModules;

const isAvailable = Platform.OS === "ios" && ScreenTimeModule != null;

export async function requestAuthorization() {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.requestAuthorization();
}

export async function getAuthorizationStatus() {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.getAuthorizationStatus();
}

export async function showAppPicker() {
  if (!isAvailable) return { selectedCount: 0 };
  return ScreenTimeModule.showAppPicker();
}

export async function showAppPickerForList(listId) {
  if (!isAvailable) return { selectedCount: 0 };
  return ScreenTimeModule.showAppPickerForList(listId);
}

export async function blockSelectedApps() {
  if (!isAvailable) return { blockedCount: 0 };
  return ScreenTimeModule.blockSelectedApps();
}

export async function blockLists(listIds) {
  if (!isAvailable) return { blockedCount: 0 };
  return ScreenTimeModule.blockLists(listIds);
}

export async function unblockApp(appTokenString) {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.unblockApp(appTokenString);
}

export async function reblockAllApps() {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.reblockAllApps();
}

export async function clearAllBlocks() {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.clearAllBlocks();
}

export async function deleteBlockList(listId) {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.deleteBlockList(listId);
}

export async function createSchedule(scheduleId, startHour, startMinute, endHour, endMinute) {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.createSchedule(scheduleId, startHour, startMinute, endHour, endMinute);
}

export async function deleteSchedule(scheduleId) {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.deleteSchedule(scheduleId);
}

export async function startMonitoring(durationMinutes) {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.startMonitoring(durationMinutes);
}

export async function stopMonitoring() {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.stopMonitoring();
}

export async function syncToAppGroup(coins, peekFee, fullFee) {
  if (!isAvailable) return { status: "unavailable" };
  return ScreenTimeModule.syncToAppGroup(coins, peekFee, fullFee);
}

export async function syncFromAppGroup() {
  if (!isAvailable) return null;
  return ScreenTimeModule.syncFromAppGroup();
}

export function isScreenTimeAvailable() {
  return isAvailable;
}
