import React, { useEffect } from "react";
import { StatusBar, View } from "react-native";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";
import { usePinCodeStatus } from "app/features/pinCode/ui/PinCodeStatusProvider";
import DrizzleStudio from "db/DrizzleStudio";
import colors from "constants/colors";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";

const RootNavigator: React.FC = () => {
  const { pinVisible, isLoading } = usePinCodeStatus();
  const { closeSheet } = useActionSheet();

  useEffect(() => {
    if (pinVisible) {
      closeSheet();
    }
  }, [pinVisible]);

  return (
    <View style={{ flex: 1 }}>
      {__DEV__ && <DrizzleStudio />}
      <StatusBar animated={true} backgroundColor={colors.greenMint} />
      {pinVisible && !isLoading ? <AuthNavigator /> : <AppNavigator />}
    </View>
  );
};

export default RootNavigator;
