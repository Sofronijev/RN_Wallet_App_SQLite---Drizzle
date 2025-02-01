import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

const useUserInactivityState = () => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background") {
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
