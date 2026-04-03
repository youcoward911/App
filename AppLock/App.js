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
import { View, Text } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ emoji, focused }) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 32,
        borderRadius: 16,
        backgroundColor: focused ? "rgba(255, 45, 120, 0.15)" : "transparent",
      }}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0E0E1A",
          borderTopColor: "#1A1A2E",
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 70,
        },
        tabBarActiveTintColor: "#FF2D78",
        tabBarInactiveTintColor: "#5E5E72",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.5,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🐷" focused={focused} />
          ),
          tabBarLabel: "Apps",
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💀" focused={focused} />
          ),
          tabBarLabel: "Shame",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" focused={focused} />
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
