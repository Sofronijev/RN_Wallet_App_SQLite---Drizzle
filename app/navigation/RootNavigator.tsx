import React, { useEffect } from "react";
import { View } from "react-native";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";
import { usePinCodeStatus } from "app/features/pinCode/ui/PinCodeStatusProvider";
import DrizzleStudio from "db/DrizzleStudio";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { StatusBar } from "expo-status-bar";
import { useAppTheme } from "app/theme/ThemeContext";
import useNotifications from "app/notifications/useNotifications";

const RootNavigator: React.FC = () => {
  const { pinVisible, isLoading } = usePinCodeStatus();
  const { closeSheet } = useActionSheet();
  const { themeMode } = useAppTheme();

  const statusBarStyle = themeMode === "dark" ? "light" : themeMode === "light" ? "dark" : "auto";

  useEffect(() => {
    if (pinVisible) {
      closeSheet();
    }
  }, [pinVisible]);

  useNotifications();

  return (
    <View style={{ flex: 1 }}>
      {__DEV__ && <DrizzleStudio />}
      <StatusBar animated={true} style={statusBarStyle} />
      {pinVisible && !isLoading ? <AuthNavigator /> : <AppNavigator />}
    </View>
  );
};

export default RootNavigator;
