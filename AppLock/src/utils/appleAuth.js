import * as AppleAuthentication from "expo-apple-authentication";
import { OAuthProvider, linkWithCredential, signInWithCredential } from "firebase/auth";
import { auth, ensureAuth } from "./firebase";
import { loadUserFromFirestore } from "./userSync";

export async function isAppleAuthAvailable() {
  return AppleAuthentication.isAvailableAsync();
}

export function getAppleLinkedStatus() {
  const user = auth.currentUser;
  if (!user) return false;
  return user.providerData.some((p) => p.providerId === "apple.com");
}

export async function signInWithApple() {
  // Ensure we have an anonymous user first
  await ensureAuth();

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const { identityToken } = credential;
  if (!identityToken) throw new Error("No identity token from Apple");

  const provider = new OAuthProvider("apple.com");
  const oauthCredential = provider.credential({
    idToken: identityToken,
  });

  // Try to link Apple credential to existing anonymous account
  try {
    await linkWithCredential(auth.currentUser, oauthCredential);
    return { success: true, isNewLink: true };
  } catch (e) {
    if (e.code === "auth/credential-already-in-use") {
      // Apple account already exists — sign in to that account instead
      await signInWithCredential(auth, oauthCredential);
      // Load the existing account's data from Firestore
      const cloudData = await loadUserFromFirestore();
      return { success: true, isNewLink: false, restoredData: cloudData };
    }
    throw e;
  }
}
