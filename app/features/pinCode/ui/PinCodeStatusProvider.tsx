import { getPinCode } from "app/services/userQueries";
import React, {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";
import useUserInactivityState from "../hooks/useUserInactivityState";

type PinCodeStatusProps = {
  pinVisible: boolean;
  closePinScreen: () => void;
  showPinCode: () => void;
  isLoading: boolean;
};

export const PinCodeStatusContext = createContext<PinCodeStatusProps | null>(null);

export const PinCodeStatusProvider: FC<PropsWithChildren> = ({ children }) => {
  const [pinVisible, setPinVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // useUserInactivityState();

  useEffect(() => {
    setIsLoading(true);
    getPinCode()
      .then((data) => {
        if (data) {
          setPinVisible(data.isPinEnabled && !!data.pinCode);
        }
      })
      .catch((error) => {
        console.log(error);
        setPinVisible(false);
        Alert.alert(
          "Failed to load PIN settings",
          "Please try setting up a new PIN if the issue persists."
        );
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
