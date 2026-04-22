import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { AppLockProvider, useAppLock } from "./src/context/AppLockContext";
import HomeScreen from "./src/screens/HomeScreen";
import AddAppsScreen from "./src/screens/AddAppsScreen";
import UnlockScreen from "./src/screens/UnlockScreen";
import StatsScreen from "./src/screens/StatsScreen";

import CoinShopScreen from "./src/screens/CoinShopScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import WeightLevelUpModal from "./src/components/WeightLevelUpModal";
import { View, StyleSheet, Text, Animated, Dimensions } from "react-native";
import { PigIcon } from "./src/components/PigMascot";
import { getMasterCommand } from "./src/data/roastMessages";
import { getPigWeight } from "./src/utils/pigWeight";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ type, focused }) {
  return (
    <View style={styles.tabIconWrap}>
      {type === "apps" && (
        <View style={[styles.tabBox, focused && styles.tabBoxActive]}>
          <View style={styles.tabBoxInner}>
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#FF69B4" : "#AEAEB2" }]} />
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#FF69B4" : "#AEAEB2" }]} />
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#FF69B4" : "#AEAEB2" }]} />
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#FF69B4" : "#AEAEB2" }]} />
          </View>
        </View>
      )}
      {type === "shame" && (
        <View style={styles.tabBarIcon}>
          <View style={[styles.barGroup]}>
            <View style={[styles.bar, styles.barShort, { backgroundColor: focused ? "#FF69B4" : "#AEAEB2" }]} />
            <View style={[styles.bar, styles.barMed, { backgroundColor: focused ? "#FF69B4" : "#AEAEB2" }]} />
            <View style={[styles.bar, styles.barTall, { backgroundColor: focused ? "#FF69B4" : "#AEAEB2" }]} />
          </View>
        </View>
      )}
      {type === "leaderboard" && (
        <View style={styles.tabBarIcon}>
          <View style={styles.trophyWrap}>
            <View style={[styles.trophyCup, { backgroundColor: focused ? "#FF69B4" : "#AEAEB2" }]} />
            <View style={[styles.trophyStem, { backgroundColor: focused ? "#FF69B4" : "#AEAEB2" }]} />
            <View style={[styles.trophyBase, { backgroundColor: focused ? "#FF69B4" : "#AEAEB2" }]} />
          </View>
        </View>
      )}
      {type === "settings" && (
        <View style={[styles.gearWrap]}>
          <View style={[styles.gearOuter, { borderColor: focused ? "#FF69B4" : "#AEAEB2" }]}>
            <View style={[styles.gearInner, { backgroundColor: focused ? "#FF69B4" : "#AEAEB2" }]} />
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
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          height: 80,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          elevation: 5,
        },
        tabBarActiveTintColor: "#FF69B4",
        tabBarInactiveTintColor: "#AEAEB2",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
          textTransform: "uppercase",
        },
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
          tabBarLabel: "Shame",
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
  const prevWeightKey = useRef(getPigWeight(state.totalCoinsSpent).key);
  const [levelUp, setLevelUp] = useState(null);
  const pendingLevelUp = useRef(null);
  const initialized = useRef(false);
  const [onMainScreen, setOnMainScreen] = useState(true);

  // Detect weight changes — queue but don't show yet
  useEffect(() => {
    const current = getPigWeight(state.totalCoinsSpent).key;
    if (!initialized.current) {
      initialized.current = true;
      prevWeightKey.current = current;
      return;
    }
    if (current !== prevWeightKey.current) {
      pendingLevelUp.current = { oldWeight: prevWeightKey.current, newWeight: current };
      prevWeightKey.current = current;
      // If already on main screen, show immediately
      if (onMainScreen) {
        setLevelUp(pendingLevelUp.current);
        pendingLevelUp.current = null;
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
        setTimeout(() => {
          setLevelUp(pendingLevelUp.current);
          pendingLevelUp.current = null;
        }, 500);
      }
    });
    return unsubscribe;
  }, [navigationRef]);

  return (
    <>
      {children}
      <WeightLevelUpModal
        visible={!!levelUp}
        oldWeight={levelUp?.oldWeight || "starving"}
        newWeight={levelUp?.newWeight || "bony"}
        onDismiss={() => setLevelUp(null)}
      />
    </>
  );
}

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [showSplash, setShowSplash] = useState(true);
  const splashBgOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const command = useRef(getMasterCommand()).current;

  useEffect(() => {
    // Fade up and in
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

    // After 3 seconds, fade everything out
    const timer = setTimeout(() => {
      Animated.timing(splashBgOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLockProvider>
      <WeightWatcher navigationRef={navigationRef}>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={HomeTabs} />
          <Stack.Screen
            name="AddApps"
            component={AddAppsScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="Unlock"
            component={UnlockScreen}
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="CoinShop"
            component={CoinShopScreen}
            options={{ presentation: "modal" }}
          />
        </Stack.Navigator>
        {showSplash && (
          <Animated.View
            style={[
              styles.splash,
              { opacity: splashBgOpacity },
            ]}
          >
            <Animated.Text
              style={[
                styles.splashText,
                { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
              ]}
            >
              {command}
            </Animated.Text>
          </Animated.View>
        )}
      </NavigationContainer>
      </WeightWatcher>
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
    backgroundColor: "#FF69B4",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    paddingHorizontal: 40,
  },
  splashText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  tabIconWrap: {
    alignItems: "center",
  },
  tabDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#FF69B4",
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
