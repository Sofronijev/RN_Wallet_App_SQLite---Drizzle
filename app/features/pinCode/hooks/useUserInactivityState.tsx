import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

const useUserInactivityState = () => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log(appState, nextAppState);
      if (nextAppState === "background") {
        // navigation.navigate("PinCode");
      } else if (nextAppState === "active" && appState.current === "background") {
      }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
};

export default useUserInactivityState;
