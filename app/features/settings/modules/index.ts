import { alertButtonStrings, deleteUserDataStrings, logoutAlertStrings } from "constants/strings";
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

export const showDeleteCategoryAlert = (onDelete: () => void) => {
  Alert.alert(
    "Delete this category?",
    "All transactions related to this category will be permanently deleted. This action cannot be undone.",
    [{ text: "Cancel" }, { onPress: onDelete, text: "Delete", style: "destructive" }],
    { cancelable: true }
  );
};
