import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCATION_KEY = "@scrollpig_location";

let Location = null;
try {
  Location = require("expo-location");
} catch (e) {
  console.warn("[location] expo-location not available — leaderboard will show as Unknown city");
}

export async function requestLocationPermission() {
  if (!Location) return false;
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  } catch (e) {
    return false;
  }
}

export async function getUserCity() {
  // Check cache first
  try {
    const cached = await AsyncStorage.getItem(LOCATION_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Cache for 24 hours
      if (Date.now() - parsed.timestamp < 86400000) {
        return parsed;
      }
    }
  } catch (e) {}

  if (!Location) return null;

  try {
    // Only use location if already granted — don't prompt here
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });

    const [place] = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });

    if (!place) return null;

    const result = {
      city: place.city || place.subregion || "Unknown",
      state: place.region || "",
      country: place.country || "",
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(result));
    return result;
  } catch (e) {
    console.warn("Location error:", e);
    return null;
  }
}
