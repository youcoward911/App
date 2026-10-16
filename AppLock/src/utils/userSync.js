import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, ensureAuth } from "./firebase";

const SYNC_FIELDS = [
  "piggyCoins",
  "totalCoinsPurchased",
  "totalCoinsSpent",
  "totalMoneySpent",
  "totalUnlocks",
  "totalPeeks",
  "totalSurrenders",
  "ironSnoutStreak",
  "bestIronSnout",
  "isProPig",
  "proPigSince",
  "activeSkin",
  "settings",
];

export async function syncUserToFirestore(state) {
  const user = await ensureAuth();
  if (!user) return;

  const data = {};
  for (const key of SYNC_FIELDS) {
    if (state[key] !== undefined) data[key] = state[key];
  }
  // Sync block list metadata (names/IDs only, not native tokens)
  if (state.blockLists) {
    data.blockLists = state.blockLists.map((l) => ({
      id: l.id,
      name: l.name,
      appCount: l.appCount,
      isActive: l.isActive,
    }));
  }
  data.lastSyncedAt = serverTimestamp();

  const ref = doc(db, "users", user.uid);
  await setDoc(ref, data, { merge: true });
}

export async function loadUserFromFirestore() {
  const user = await ensureAuth();
  if (!user) return null;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

export function shouldSync(prev, next) {
  for (const key of SYNC_FIELDS) {
    if (prev[key] !== next[key]) return true;
  }
  return false;
}
