import * as SecureStore from "expo-secure-store";

export const storeToLocalStorage = async <T>(key: string, data: T) => {
  try {
    return await SecureStore.setItemAsync(key, JSON.stringify(data));
  } catch (error) {
    throw error;
  }
};

export const getFromLocalStorage = (key: string) => {
  const data = SecureStore.getItem(key);
  return data && JSON.parse(data);
};

export const removeFromLocalStorage = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    throw error;
  }
};
