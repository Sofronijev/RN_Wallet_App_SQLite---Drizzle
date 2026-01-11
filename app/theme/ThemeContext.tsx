import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
  useMemo,
  useCallback,
} from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";
import colors from "constants/colors";
import { AppTheme } from "./useThemedStyles";

type ThemeMode = "light" | "dark" | "auto";

const lightTheme: AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.greenMint,
    background: "#F5F5F5",
    card: colors.white,
    text: "#111111",
    border: "#E5E5E5",
    notification: "#FF3B30",
    header: colors.greenMint,
    //CUSTOM
    danger: colors.danger,
    hyperlink: colors.hyperlink,
    muted: colors.grey2,
    redDark: colors.redDark,
    shadow: colors.black,
    selected: colors.greenLight,
    disabled: colors.disabled,
    placeholder: "#9E9E9E",
    cardInner: colors.grey3,
    info: "#E3F2fD",
    grey: "#666666",
  },
};

const darkTheme: AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.greenMintDark,
    background: "#121212",
    card: "#202020ff",
    text: "#EDEDED",
    border: "#38383A",
    notification: "#FF453A",
    header: colors.black,
    //CUSTOM
    danger: "#E33F50",
    hyperlink: "#4FC3FF",
    muted: "#A0A0A0",
    redDark: "#D36A58",
    shadow: colors.black,
    selected: "#244D3A",
    disabled: "#4A4F55",
    placeholder: "#7A7A7A",
    cardInner: "#2C2C2C",
    info: "#2a3f5f",
    grey: "#AAAAAA",
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
  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await SecureStore.setItemAsync("themeMode", mode);
  }, []);

  const contextValue = useMemo(() => ({ themeMode, setThemeMode, theme }), [themeMode, theme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useAppTheme must be used within ThemeProvider");
  return context;
};
