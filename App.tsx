import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./app/navigation/RootNavigator";
import { StatusBar } from "react-native";
import colors from "constants/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import AlertPromptProvider from "modules/AlertPrompt/AlertPrompt";

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <MenuProvider>
      <NavigationContainer>
        <StatusBar animated={true} backgroundColor={colors.greenMint} />
        <RootNavigator />
      </NavigationContainer>
      <AlertPromptProvider />
    </MenuProvider>
  </GestureHandlerRootView>
);

export default App;
