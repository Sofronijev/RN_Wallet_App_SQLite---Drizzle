import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import colors from "constants/colors";
import { HomeStackParamList } from "./routes";
import { Ionicons } from "@expo/vector-icons";
import SettingsScreen from "app/features/settings";
import BalanceScreen from "app/features/balance/ui/BalanceTab/BalanceScreen";

const Tab = createBottomTabNavigator<HomeStackParamList>();

const HomeNavigator = () => (
  <Tab.Navigator
    initialRouteName='Balance'
    screenOptions={{
      tabBarActiveTintColor: colors.greenMint,
      headerStyle: {
        backgroundColor: colors.greenMint,
      },
      headerTitleAlign: "center",
      headerTitleStyle: { color: colors.white },
    }}
  >
    <Tab.Screen
      name='Balance'
      component={BalanceScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name='wallet' size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name='Settings'
      component={SettingsScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Ionicons name='settings' size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

export default HomeNavigator;
