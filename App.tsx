import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./app/navigation/RootNavigator";
import { StatusBar } from "react-native";
import colors from "constants/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import AlertPromptProvider from "components/AlertPrompt/AlertPrompt";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <NavigationContainer>
          <StatusBar animated={true} backgroundColor={colors.greenMint} />
          <RootNavigator />
        </NavigationContainer>
        <AlertPromptProvider />
      </MenuProvider>
    </GestureHandlerRootView>
  </QueryClientProvider>
);

export default App;
