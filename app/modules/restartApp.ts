import { DevSettings } from "react-native";
import * as Updates from "expo-updates";

export const restartApp = async () => {
  if (__DEV__) {
    DevSettings.reload();
    return;
  }

  await Updates.reloadAsync();
};
