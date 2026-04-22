import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db, ensureAuth } from "./firebase";
import { getUserCity } from "./location";
import { getPigWeight } from "./pigWeight";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PIG_NAMES_KEY = "@scrollpig_pigname";
const LEADERBOARD_COL = "pigs";

// Generate a random pig name for anonymous users
const PIG_ADJECTIVES = [
  "Sloppy", "Greasy", "Filthy", "Muddy", "Greedy", "Chunky",
  "Crusty", "Slimy", "Stinky", "Grimy", "Nasty", "Mushy",
  "Soggy", "Grubby", "Messy", "Gooey", "Slobbery", "Pudgy",
  "Wobbly", "Lumpy", "Drippy", "Scruffy", "Mucky", "Sweaty",
];

const PIG_NOUNS = [
  "Pig", "Hog", "Piglet", "Swine", "Boar", "Porker",
  "Oinker", "Trotter", "Snout", "Piggy", "Slop-Eater", "Mud-Roller",
  "Trough-Face", "Oink-Machine", "Pay-Pig", "Scroll-Hog", "Coin-Pig",
  "Slop-Lord", "Feed-Beast", "Wallow-King",
];

async function getPigName() {
  try {
    const stored = await AsyncStorage.getItem(PIG_NAMES_KEY);
    if (stored) return stored;
  } catch (e) {}

  const adj = PIG_ADJECTIVES[Math.floor(Math.random() * PIG_ADJECTIVES.length)];
  const noun = PIG_NOUNS[Math.floor(Math.random() * PIG_NOUNS.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  const name = `${adj} ${noun} #${num}`;

  try {
    await AsyncStorage.setItem(PIG_NAMES_KEY, name);
  } catch (e) {}

  return name;
}

// Profanity / inappropriate word filter
const BLOCKED_WORDS = [
  "fuck","shit","ass","bitch","dick","cock","pussy","cunt","nigger","nigga",
  "fag","faggot","retard","whore","slut","bastard","damn","hell","penis",
  "vagina","tits","boobs","anal","rape","nazi","hitler","kill","murder",
  "suicide","porn","sex","nude","naked","molest","pedo","pedophile",
];

function isAppropriate(name) {
  const lower = name.toLowerCase().replace(/[^a-z]/g, " ");
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) return false;
  }
  return true;
}

export async function setPigName(newName) {
  const trimmed = newName.trim();
  if (trimmed.length < 2 || trimmed.length > 24) {
    return { ok: false, error: "Name must be 2-24 characters" };
  }
  if (!isAppropriate(trimmed)) {
    return { ok: false, error: "That name isn't allowed. Keep it clean, piggy." };
  }
  try {
    await AsyncStorage.setItem(PIG_NAMES_KEY, trimmed);
    // Update Firestore too
    const user = await ensureAuth();
    if (user) {
      await setDoc(doc(db, LEADERBOARD_COL, user.uid), { pigName: trimmed }, { merge: true });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "Failed to save name" };
  }
}

export { getPigName };

// Update user's leaderboard entry after a tribute
export async function updateLeaderboard(totalCoinsSpent, totalUnlocks) {
  try {
    const user = await ensureAuth();
    if (!user) return;

    const location = await getUserCity();
    const pigName = await getPigName();

    const weight = getPigWeight(totalCoinsSpent);
    const data = {
      uid: user.uid,
      pigName,
      totalCoinsSpent,
      totalUnlocks,
      weightKey: weight.key,
      weightLabel: weight.label,
      weightEmoji: weight.emoji,
      city: location?.city || "Unknown",
      state: location?.state || "",
      country: location?.country || "",
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, LEADERBOARD_COL, user.uid), data, { merge: true });
  } catch (e) {
    console.warn("Leaderboard update failed:", e);
  }
}

// Get top 50 pigs in user's city
export async function getCityLeaderboard() {
  try {
    const location = await getUserCity();
    if (!location?.city) return { city: "Unknown", entries: [] };

    const q = query(
      collection(db, LEADERBOARD_COL),
      where("city", "==", location.city),
      orderBy("totalCoinsSpent", "desc"),
      limit(50)
    );

    const snap = await getDocs(q);
    const entries = snap.docs.map((d) => d.data());

    return { city: location.city, state: location.state, entries };
  } catch (e) {
    console.warn("City leaderboard fetch failed:", e);
    return { city: "Unknown", entries: [] };
  }
}

// Get top 50 pigs globally
export async function getGlobalLeaderboard() {
  try {
    const q = query(
      collection(db, LEADERBOARD_COL),
      orderBy("totalCoinsSpent", "desc"),
      limit(50)
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (e) {
    console.warn("Global leaderboard fetch failed:", e);
    return [];
  }
}

// Get current user's rank in their city
export async function getUserRank() {
  try {
    const user = await ensureAuth();
    if (!user) return null;

    const userDoc = await getDoc(doc(db, LEADERBOARD_COL, user.uid));
    if (!userDoc.exists()) return null;

    const userData = userDoc.data();
    const location = await getUserCity();
    if (!location?.city) return null;

    const q = query(
      collection(db, LEADERBOARD_COL),
      where("city", "==", location.city),
      where("totalCoinsSpent", ">", userData.totalCoinsSpent)
    );

    const snap = await getDocs(q);
    return {
      rank: snap.size + 1,
      city: location.city,
      pigName: userData.pigName,
      totalCoinsSpent: userData.totalCoinsSpent,
    };
  } catch (e) {
    console.warn("User rank fetch failed:", e);
    return null;
  }
}
