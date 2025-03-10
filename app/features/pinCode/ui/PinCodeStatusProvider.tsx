import { getPinCode } from "app/services/userQueries";
import React, {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert, AppState } from "react-native";

type PinCodeStatusProps = {
  pinVisible: boolean;
  closePinScreen: () => void;
  showPinCode: () => void;
  isLoading: boolean;
};

const pinAlert = () =>
  Alert.alert(
    "Failed to load PIN settings",
    "Please try setting up a new PIN if the issue persists."
  );

export const PinCodeStatusContext = createContext<PinCodeStatusProps | null>(null);

export const PinCodeStatusProvider: FC<PropsWithChildren> = ({ children }) => {
  const [pinVisible, setPinVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const backgroundTimestampRef = useRef<number | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background") {
        backgroundTimestampRef.current = Date.now();
      } else if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        getPinCode()
          .then((data) => {
            if (data) {
              if (
                data.inactivePinTimeout != null &&
                backgroundTimestampRef.current &&
                data.isPinEnabled &&
                !!data.pinCode
              ) {
                const elapsedSeconds = (Date.now() - backgroundTimestampRef.current) / 1000;
                if (elapsedSeconds >= data.inactivePinTimeout) {
                  setPinVisible(true);
                }
              }
            }
          })
          .catch(() => {
            setPinVisible(false);
            pinAlert();
          });
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    getPinCode()
      .then((data) => {
        if (data) {
          setPinVisible(data.isPinEnabled && !!data.pinCode);
        }
      })
      .catch(() => {
        setPinVisible(false);
        pinAlert();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const closePinScreen = () => {
    setPinVisible(false);
  };

  const showPinCode = () => {
    setPinVisible(true);
  };

  return (
    <PinCodeStatusContext.Provider value={{ pinVisible, isLoading, closePinScreen, showPinCode }}>
      {children}
    </PinCodeStatusContext.Provider>
  );
};

export const usePinCodeStatus = () => {
  const context = useContext(PinCodeStatusContext);
  if (!context) {
    throw new Error("usePinCodeStatus must be used within an PinCodeStatusProvider");
  }
  return context;
};
