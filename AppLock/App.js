import React, { useState, useEffect, useRef } from "react";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

Sentry.init({
  dsn: Constants.expoConfig?.extra?.sentryDsn,
  tracesSampleRate: 0.2,
  enabled: !__DEV__,
});
import { AppLockProvider, useAppLock } from "./src/context/AppLockContext";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import PaywallScreen from "./src/screens/PaywallScreen";
import ScheduleScreen from "./src/screens/ScheduleScreen";
import BlockListDetailScreen from "./src/screens/BlockListDetailScreen";
import CustomAlert from "./src/components/CustomAlert";
// AddAppsScreen removed — replaced by FamilyActivityPicker in onboarding
import HomeScreen from "./src/screens/HomeScreen";
import UnlockScreen from "./src/screens/UnlockScreen";
import StatsScreen from "./src/screens/StatsScreen";

import CoinShopScreen from "./src/screens/CoinShopScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import LevelUpScreen from "./src/screens/LevelUpScreen";
import PigLockerScreen from "./src/screens/PigLockerScreen";
import SkinUnlockScreen from "./src/screens/SkinUnlockScreen";
import { View, StyleSheet, Text, Animated, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { lightTap } from "./src/utils/haptics";
import { PigIcon } from "./src/components/PigMascot";
import { getMasterCommand } from "./src/data/roastMessages";
import { getPigWeight, getLevel, checkLevelUp } from "./src/utils/pigWeight";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ type, focused }) {
  return (
    <View style={styles.tabIconWrap}>
      {type === "apps" && (
        <View style={[styles.tabBox, focused && styles.tabBoxActive]}>
          <View style={styles.tabBoxInner}>
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#4A4545" : "#B5AFA8" }]} />
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#4A4545" : "#B5AFA8" }]} />
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#4A4545" : "#B5AFA8" }]} />
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#4A4545" : "#B5AFA8" }]} />
          </View>
        </View>
      )}
      {type === "shame" && (
        <View style={styles.tabBarIcon}>
          <View style={[styles.barGroup]}>
            <View style={[styles.bar, styles.barShort, { backgroundColor: focused ? "#4A4545" : "#B5AFA8" }]} />
            <View style={[styles.bar, styles.barMed, { backgroundColor: focused ? "#4A4545" : "#B5AFA8" }]} />
            <View style={[styles.bar, styles.barTall, { backgroundColor: focused ? "#4A4545" : "#B5AFA8" }]} />
          </View>
        </View>
      )}
      {type === "leaderboard" && (
        <View style={styles.tabBarIcon}>
          <View style={styles.trophyWrap}>
            <View style={[styles.trophyCup, { backgroundColor: focused ? "#4A4545" : "#B5AFA8" }]} />
            <View style={[styles.trophyStem, { backgroundColor: focused ? "#4A4545" : "#B5AFA8" }]} />
            <View style={[styles.trophyBase, { backgroundColor: focused ? "#4A4545" : "#B5AFA8" }]} />
          </View>
        </View>
      )}
      {type === "settings" && (
        <View style={[styles.gearWrap]}>
          <View style={[styles.gearOuter, { borderColor: focused ? "#4A4545" : "#B5AFA8" }]}>
            <View style={[styles.gearInner, { backgroundColor: focused ? "#4A4545" : "#B5AFA8" }]} />
          </View>
        </View>
      )}
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          height: 85,
          paddingTop: 10,
          shadowColor: "#B5AFA8",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 5,
        },
        tabBarActiveTintColor: "#4A4545",
        tabBarInactiveTintColor: "#B5AFA8",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
          textTransform: "uppercase",
        },
        tabBarButton: (props) => (
          <TouchableOpacity {...props} onPress={(e) => { lightTap(); props.onPress?.(e); }} />
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon type="apps" focused={focused} />
          ),
          tabBarLabel: "Apps",
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon type="shame" focused={focused} />
          ),
          tabBarLabel: "Stats",
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon type="leaderboard" focused={focused} />
          ),
          tabBarLabel: "Board",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon type="settings" focused={focused} />
          ),
          tabBarLabel: "Settings",
        }}
      />
    </Tab.Navigator>
  );
}

function WeightWatcher({ children, navigationRef }) {
  const { state } = useAppLock();
  const prevXP = useRef(state.totalCoinsSpent);
  const pendingLevelUp = useRef(null);
  const initialized = useRef(false);
  const [onMainScreen, setOnMainScreen] = useState(true);

  // Detect level-up via XP changes — navigate to LevelUpScreen
  useEffect(() => {
    const oldXP = prevXP.current;
    const newXP = state.totalCoinsSpent;
    if (!initialized.current) {
      initialized.current = true;
      prevXP.current = newXP;
      return;
    }
    prevXP.current = newXP;
    const result = checkLevelUp(oldXP, newXP);
    if (result) {
      const params = {
        fromLevel: result.from,
        toLevel: result.to,
        xp: newXP,
      };
      if (onMainScreen && navigationRef?.current) {
        setTimeout(() => {
          navigationRef.current.navigate("LevelUp", params);
        }, 300);
      } else {
        pendingLevelUp.current = params;
      }
    }
  }, [state.totalCoinsSpent, onMainScreen]);

  // Listen for navigation state changes
  useEffect(() => {
    if (!navigationRef?.current) return;
    const unsubscribe = navigationRef.current.addListener("state", () => {
      const route = navigationRef.current.getCurrentRoute();
      const isMain = route?.name === "Home" || route?.name === "Main" || route?.name === "Stats" || route?.name === "Leaderboard";
      setOnMainScreen(isMain);
      // Show queued level-up when returning to main
      if (isMain && pendingLevelUp.current) {
        const params = pendingLevelUp.current;
        pendingLevelUp.current = null;
        setTimeout(() => {
          navigationRef.current.navigate("LevelUp", params);
        }, 500);
      }
    });
    return unsubscribe;
  }, [navigationRef]);

  return <>{children}</>;
}

const ONBOARDED_KEY = "@scrollpig_onboarded";

function App() {
  const navigationRef = useNavigationContainerRef();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const splashBgOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const command = useRef(getMasterCommand()).current;

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY).then((val) => {
      if (!val) setShowOnboarding(true);
      setOnboardingChecked(true);
    });
  }, []);

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, "1");
    setShowOnboarding(false);
  };

  // Only run splash when NOT onboarding — so the splash never covers the auth prompt
  useEffect(() => {
    if (showOnboarding) {
      setShowSplash(false);
      return;
    }
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(splashBgOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 3000);

    return () => clearTimeout(timer);
  }, [onboardingChecked, showOnboarding]);

  if (!onboardingChecked) return null;

  return (
    <AppLockProvider>
      {showOnboarding ? (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      ) : (
      <WeightWatcher navigationRef={navigationRef}>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={HomeTabs} />
          <Stack.Screen
            name="Unlock"
            component={UnlockScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="CoinShop"
            component={CoinShopScreen}
            options={{ presentation: "modal", gestureEnabled: true, gestureDirection: "vertical" }}
          />
          <Stack.Screen
            name="Paywall"
            component={PaywallScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Schedules"
            component={ScheduleScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="BlockListDetail"
            component={BlockListDetailScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="LevelUp"
            component={LevelUpScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="PigLocker"
            component={PigLockerScreen}
            options={{ presentation: "fullScreenModal", headerShown: false }}
          />
          <Stack.Screen
            name="SkinUnlock"
            component={SkinUnlockScreen}
            options={{ presentation: "fullScreenModal", headerShown: false }}
          />
        </Stack.Navigator>
        {showSplash && (
          <Animated.View
            style={[
              styles.splash,
              { opacity: splashBgOpacity },
            ]}
          >
            <LinearGradient
              colors={["#EDE8E4", "#F5CCD5"]}
              style={styles.splashGradient}
            >
              <Animated.Text
                style={[
                  styles.splashText,
                  { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
                ]}
              >
                {command}
              </Animated.Text>
            </LinearGradient>
          </Animated.View>
        )}
      </NavigationContainer>
      </WeightWatcher>
      )}
      <CustomAlert />
    </AppLockProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: SCREEN_H,
    zIndex: 100,
  },
  splashGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },
  splashText: {
    color: "#4A4545",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 46,
    letterSpacing: -1,
  },
  tabIconWrap: {
    alignItems: "center",
  },
  tabDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#4A4545",
    marginTop: 4,
  },
  // Apps grid icon
  tabBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBoxInner: {
    width: 20,
    height: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
  },
  miniSquare: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  // Bar chart icon
  tabBarIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  bar: {
    width: 5,
    borderRadius: 1.5,
  },
  barShort: { height: 8 },
  barMed: { height: 14 },
  barTall: { height: 20 },
  // Trophy icon
  trophyWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 22,
  },
  trophyCup: {
    width: 14,
    height: 10,
    borderRadius: 3,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  trophyStem: {
    width: 4,
    height: 4,
  },
  trophyBase: {
    width: 12,
    height: 2.5,
    borderRadius: 1,
  },
  // Gear icon
  gearWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  gearOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  gearInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default Sentry.wrap(App);
