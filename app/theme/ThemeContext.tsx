import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Theme as NavigationTheme, DefaultTheme, DarkTheme } from "@react-navigation/native";
import colors from "constants/colors";
import { AppTheme } from "./useThemedStyles";

type ThemeMode = "light" | "dark" | "auto";

const lightTheme: AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#007AFF",
    background: "#F5F5F5",
    card: "#F5F5F5",
    text: "#000000",
    border: "#E5E5E5",
    notification: "#FF3B30",
    header: colors.greenMint,
  },
};

const darkTheme: AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#0A84FF",
    background: "#121212",
    card: "#1C1C1E",
    text: "#FFFFFF",
    border: "#38383A",
    notification: "#FF453A",
    header: colors.black,
  },
};

type ThemeContextType = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  theme: AppTheme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto");

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync("themeMode");
      if (saved) setThemeModeState(saved as ThemeMode);
    })();
  }, []);

  const isDark = themeMode === "dark" || (themeMode === "auto" && systemColorScheme === "dark");
  const theme = isDark ? darkTheme : lightTheme;

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await SecureStore.setItemAsync("themeMode", mode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useAppTheme must be used within ThemeProvider");
  return context;
};
