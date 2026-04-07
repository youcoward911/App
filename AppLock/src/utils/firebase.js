import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence, signInAnonymously } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Replace with your Firebase project config
// Go to console.firebase.google.com → your project → Project Settings → General → Your apps → Web app
const firebaseConfig = {
  apiKey: "AIzaSyDIDFvj09JrsX6ibR3pzeMMJRsONA-BMdU",
  authDomain: "scrollpig.firebaseapp.com",
  projectId: "scrollpig",
  storageBucket: "scrollpig.firebasestorage.app",
  messagingSenderId: "1086523023976",
  appId: "1:1086523023976:web:904f1d5bcd8822359151dd",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

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
