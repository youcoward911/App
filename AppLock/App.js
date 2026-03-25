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
import { Text } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1A1A2E",
          borderTopColor: "#2D2D4A",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: "#E94560",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🔒</Text>,
          tabBarLabel: "Locked",
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📊</Text>,
          tabBarLabel: "Shame",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>⚙️</Text>,
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
            options={{
              presentation: "modal",
              animationTypeForReplace: "push",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppLockProvider>
  );
}
