import React from "react";
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
import { View, StyleSheet } from "react-native";
import { PigIcon } from "./src/components/PigMascot";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ type, focused }) {
  return (
    <View style={styles.tabIconWrap}>
      {type === "apps" && (
        <View style={[styles.tabBox, focused && styles.tabBoxActive]}>
          <View style={styles.tabBoxInner}>
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#FF2D55" : "#AEAEB2" }]} />
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#FF2D55" : "#AEAEB2" }]} />
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#FF2D55" : "#AEAEB2" }]} />
            <View style={[styles.miniSquare, { backgroundColor: focused ? "#FF2D55" : "#AEAEB2" }]} />
          </View>
        </View>
      )}
      {type === "shame" && (
        <View style={styles.tabBarIcon}>
          <View style={[styles.barGroup]}>
            <View style={[styles.bar, styles.barShort, { backgroundColor: focused ? "#FF2D55" : "#AEAEB2" }]} />
            <View style={[styles.bar, styles.barMed, { backgroundColor: focused ? "#FF2D55" : "#AEAEB2" }]} />
            <View style={[styles.bar, styles.barTall, { backgroundColor: focused ? "#FF2D55" : "#AEAEB2" }]} />
          </View>
        </View>
      )}
      {type === "settings" && (
        <View style={[styles.gearWrap]}>
          <View style={[styles.gearOuter, { borderColor: focused ? "#FF2D55" : "#AEAEB2" }]}>
            <View style={[styles.gearInner, { backgroundColor: focused ? "#FF2D55" : "#AEAEB2" }]} />
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
        tabBarActiveTintColor: "#FF2D55",
        tabBarInactiveTintColor: "#AEAEB2",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
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
  return (
    <AppLockProvider>
      <NavigationContainer>
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
      </NavigationContainer>
    </AppLockProvider>
  );
}

const styles = StyleSheet.create({
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
