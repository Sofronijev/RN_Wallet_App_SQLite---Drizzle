import React, { useEffect, useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import AppNavigator from "./AppNavigator";
import { Alert, View } from "react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";
import { db } from "db";
import DrizzleStudio from "db/DrizzleStudio";
import useUserInactivityState from "app/features/pinCode/hooks/useUserInactivityState";
import AuthNavigator from "./AuthNavigator";

SplashScreen.preventAutoHideAsync();

const RootNavigator: React.FC = () => {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (error) {
      Alert.alert(
        "Initialization Error",
        "There was a problem initializing the app. Please try restarting the app. If the issue persists, consider reinstalling the app."
      );
    }
  }, [error]);

  const onLayoutRootView = useCallback(async () => {
    if (success) {
      await SplashScreen.hideAsync();
    }
  }, [success]);

  useUserInactivityState();

  if (!success) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {__DEV__ && <DrizzleStudio />}
      {false ? <AuthNavigator /> : <AppNavigator />}
    </View>
  );
};

export default RootNavigator;
