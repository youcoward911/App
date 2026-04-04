import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { AppLockProvider } from "./src/context/AppLockContext";
import HomeScreen from "./src/screens/HomeScreen";
import AddAppsScreen from "./src/screens/AddAppsScreen";
import UnlockScreen from "./src/screens/UnlockScreen";
import StatsScreen from "./src/screens/StatsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import CoinShopScreen from "./src/screens/CoinShopScreen";
import { View, StyleSheet, Text, Animated, Dimensions } from "react-native";
import { PigIcon } from "./src/components/PigMascot";
import { getMasterCommand } from "./src/data/roastMessages";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ type, focused }) {
  return (
    <View style={styles.tabIconWrap}>
      {type === "apps" && (
        <View style={[styles.tabBox, focused && styles.tabBoxActive]}>
          <View style={styles.tabBoxInner}>
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#FF2D55" : "rgba(255,255,255,0.4)" }]} />
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#FF2D55" : "rgba(255,255,255,0.4)" }]} />
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#FF2D55" : "rgba(255,255,255,0.4)" }]} />
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#FF2D55" : "rgba(255,255,255,0.4)" }]} />
          </View>
        </View>
      )}
      {type === "shame" && (
        <View style={styles.tabBarIcon}>
          <View style={[styles.barGroup]}>
            <View style={[styles.bar, styles.barShort, { backgroundColor: focused ? "#FF2D55" : "rgba(255,255,255,0.4)" }]} />
            <View style={[styles.bar, styles.barMed, { backgroundColor: focused ? "#FF2D55" : "rgba(255,255,255,0.4)" }]} />
            <View style={[styles.bar, styles.barTall, { backgroundColor: focused ? "#FF2D55" : "rgba(255,255,255,0.4)" }]} />
          </View>
        </View>
      )}
      {type === "settings" && (
        <View style={[styles.gearWrap]}>
          <View style={[styles.gearOuter, { borderColor: focused ? "#FF2D55" : "rgba(255,255,255,0.4)" }]}>
            <View style={[styles.gearInner, { backgroundColor: focused ? "#FF2D55" : "rgba(255,255,255,0.4)" }]} />
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
          backgroundColor: "#2A0A14",
          borderTopWidth: 0,
          height: 80,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 5,
        },
        tabBarActiveTintColor: "#FF2D55",
        tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
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

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const splashScale = useRef(new Animated.Value(0.7)).current;
  const command = useRef(getMasterCommand()).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(splashOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(splashScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLockProvider>
      <NavigationContainer>
        <StatusBar style="light" />
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
              { opacity: splashOpacity, transform: [{ scale: splashScale }] },
            ]}
          >
            <Text style={styles.splashText}>{command}</Text>
          </Animated.View>
        )}
      </NavigationContainer>
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
    backgroundColor: "#FF2D55",
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
    backgroundColor: "#FF2D55",
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
