import { alertButtonStrings, deleteUserDataStrings, logoutAlertStrings } from "constants/strings";
import AlertPrompt from "components/AlertPrompt";
import { isNumber } from "modules/numbers";
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

export const showStartingBalancePrompt = (onSubmit: (amount: number) => void) => {
  AlertPrompt.prompt(
    "Change starting balance",
    "Enter the amount you want to use as a starting balance. This change will also affect your current balance",
    (newBalance) => {
      const balanceNumber = +newBalance;
      if (isNumber(balanceNumber)) {
        onSubmit(balanceNumber);
      }
    },
    { keyboardType: "numeric", validator: isNumber }
  );
};

export const showBalancePrompt = (onSubmit: (newBalance: number) => void) => {
  AlertPrompt.prompt(
    "Adjust balance",
    "Enter the correct balance. A correction transaction will be created to adjust it accordingly",
    (newBalance) => {
      const balanceNumber = +newBalance;
      if (isNumber(balanceNumber)) {
        onSubmit(balanceNumber);
      }
    },
    { keyboardType: "numeric", validator: isNumber }
  );
};
