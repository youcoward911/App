import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCATION_KEY = "@scrollpig_location";

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

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
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
