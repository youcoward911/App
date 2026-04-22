import { Platform } from "react-native";

let Haptics = null;

try {
  Haptics = require("expo-haptics");
} catch (e) {}

export function lightTap() {
  if (Platform.OS !== "ios" || !Haptics) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function mediumTap() {
  if (Platform.OS !== "ios" || !Haptics) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export function heavyTap() {
  if (Platform.OS !== "ios" || !Haptics) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
}

export function successTap() {
  if (Platform.OS !== "ios" || !Haptics) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function warningTap() {
  if (Platform.OS !== "ios" || !Haptics) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
