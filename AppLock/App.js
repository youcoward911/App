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
import { View, Text, StyleSheet } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ label, focused }) {
  const icons = {
    Apps: "🐷",
    Shame: "📊",
    Settings: "⚙️",
  };
  return (
    <View style={styles.tabIconWrap}>
      <Text style={{ fontSize: 22 }}>{icons[label]}</Text>
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
            <TabIcon label="Apps" focused={focused} />
          ),
          tabBarLabel: "Apps",
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Shame" focused={focused} />
          ),
          tabBarLabel: "Shame",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Settings" focused={focused} />
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
});
