import React, { useCallback, useEffect } from "react";
import { Alert, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import * as SplashScreen from "expo-splash-screen";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import AlertPromptProvider from "components/AlertPrompt/AlertPrompt";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ActionSheetProvider from "components/ActionSheet";
import { PinCodeStatusProvider } from "app/features/pinCode/ui/PinCodeStatusProvider";
import { db } from "db";
import migrations from "drizzle/migrations";
import RootNavigator from "navigation/RootNavigator";
import { ThemeProvider, useAppTheme } from "app/theme/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();
SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { success, error } = useMigrations(db, migrations);
  const { theme } = useAppTheme();

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

  if (!success) return null;
  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <PinCodeStatusProvider>
              <MenuProvider>
                <NavigationContainer theme={theme}>
                  <ActionSheetProvider>
                    <RootNavigator />
                  </ActionSheetProvider>
                </NavigationContainer>
                <AlertPromptProvider />
              </MenuProvider>
            </PinCodeStatusProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </View>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
