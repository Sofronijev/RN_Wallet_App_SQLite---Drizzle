import React, { useState, useEffect, useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import AppNavigator from "./AppNavigator";
import { Alert, View } from "react-native";
import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

SplashScreen.preventAutoHideAsync();

const expo = SQLite.openDatabaseSync("db.db");
const db = drizzle(expo);

const RootNavigator: React.FC = () => {
  // TODO - change to FALSE
  const [isReady, setIsReady] = useState(true);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppNavigator />
    </View>
  );
};

export default RootNavigator;
