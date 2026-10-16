export default {
  expo: {
    name: "Scroll Pig",
    slug: "PayPig",
    version: "1.0.6",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FAE4E8",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.paypig.app",
      icon: "./assets/icon.png",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "Scroll Pig uses your location to show your city name on the city leaderboard. For example, if you're in Brooklyn, your stats appear on the Brooklyn leaderboard alongside other users in Brooklyn. Location is used only to derive the city name and is never stored or shared.",
        ITSAppUsesNonExemptEncryption: false,
      },
      buildNumber: "7",
      usesAppleSignIn: true,
      appleTeamId: "78KK2B4DTZ",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#FAE4E8",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      package: "com.paypig.app",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "./plugins/withScreenTime",
      "./plugins/withAppIcon",
      "expo-web-browser",
      [
        "@sentry/react-native/expo",
        {
          organization: "scrollpig",
          project: "scrollpig-mobile",
        },
      ],
      "expo-apple-authentication",
      "@bacons/apple-targets",
    ],
    extra: {
      eas: {
        projectId: "fa4752e0-9878-4988-9def-e0111d9ab43f",
      },
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      sentryDsn: process.env.SENTRY_DSN,
    },
    runtimeVersion: {
      policy: "appVersion",
    },
  },
};
