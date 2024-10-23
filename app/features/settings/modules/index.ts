import { alertButtonStrings, deleteUserDataStrings, logoutAlertStrings } from "constants/strings";
import AlertPrompt from "modules/AlertPrompt";
import { Alert } from "react-native";

export const showLogoutAlert = (onLogout: () => void) => {
  Alert.alert(
    logoutAlertStrings.title,
    "",
    [
      {
        text: alertButtonStrings.cancel,
      },
      {
        text: alertButtonStrings.confirm,
        onPress: onLogout,
      },
    ],
    {
      cancelable: true,
    }
  );
};

export const showDeleteUserDataALert = (onDelete: () => void) => {
  Alert.alert(
    deleteUserDataStrings.title,
    deleteUserDataStrings.subtitle,
    [
      {
        text: alertButtonStrings.cancel,
      },
      {
        text: alertButtonStrings.delete,
        onPress: onDelete,
        style: "cancel",
      },
    ],
    {
      cancelable: true,
    }
  );
};

export const showStartingBalancePrompt = (callback: (text: string) => void) => {
  AlertPrompt.prompt(
    "Change starting balance",
    "Enter the amount you want to use as a starting balance. This change will also affect your current balance",
    (text) => {
      callback(text);
    },
    { keyboardType: "numeric" }
  );
};

export const showBalancePrompt = (callback: (text: string) => void) => {
  AlertPrompt.prompt(
    "Adjust balance",
    "Enter the correct balance. A correction transaction will be created to adjust it accordingly",
    (text) => {
      callback(text);
    },
    { keyboardType: "numeric" }
  );
};
