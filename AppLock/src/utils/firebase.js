import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// TODO: Replace with your Firebase project config
// Go to console.firebase.google.com → your project → Project Settings → General → Your apps → Web app
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

let currentUser = null;

export async function ensureAuth() {
  if (currentUser) return currentUser;
  try {
    const cred = await signInAnonymously(auth);
    currentUser = cred.user;
    return currentUser;
  } catch (e) {
    console.warn("Firebase auth failed:", e);
    return null;
  }
}
