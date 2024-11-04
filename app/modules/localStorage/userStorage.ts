import { userAuthErrorStrings } from "constants/strings";
import { Alert } from "react-native";
import { getFromLocalStorage, removeFromLocalStorage, storeToLocalStorage } from "./index";

// NOT IN USE
// This was added to save user data, but decided to have only one user per app
// Left the logic here if I allow multiple users in the future

const USER_KEY = "user";

type User = {
  id: number;
  username: string | null;
  password: string | null;
  email: string | null;
  createdAt: string;
};

export const storeUserData = async (userData: User) => {
  try {
    await storeToLocalStorage(USER_KEY, userData);
  } catch (error) {
    Alert.alert(userAuthErrorStrings.storeData, JSON.stringify(error));
  }
};

export const getUserData = (): User => {
  return getFromLocalStorage(USER_KEY);
};

export const getUserId = () => {
  const userData = getUserData();
  return userData.id;
};

export const removeUserData = async () => {
  try {
    await removeFromLocalStorage(USER_KEY);
  } catch (error) {
    Alert.alert(userAuthErrorStrings.removeData);
  }
};
