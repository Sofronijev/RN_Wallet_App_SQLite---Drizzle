import React, { useState, useEffect, useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import AppNavigator from "./AppNavigator";
import { Alert, View } from "react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";
import { db } from "db";
import useDrizzleStudio from "db/useDrizzleStudio";

SplashScreen.preventAutoHideAsync();

const RootNavigator: React.FC = () => {
  const { success, error } = useMigrations(db, migrations);
  useDrizzleStudio();

  useEffect(() => {
    if (error) {
      Alert.alert(
        "Initialization Error",
        "There was a problem initializing the app. Please try restarting the app. If the issue persists, consider reinstalling the app."
      );
    }
  }, [error]);

  const onLayoutRootView = useCallback(async () => {
    if (1) {
      await SplashScreen.hideAsync();
    }
  }, []);

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppNavigator />
    </View>
  );
};

export default RootNavigator;
