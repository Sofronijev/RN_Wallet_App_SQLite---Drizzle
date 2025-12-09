import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme, Theme } from "@react-navigation/native";

export type AppTheme = Theme & {
  colors: Theme["colors"] & {
    header: string;
    danger: string;
    hyperlink: string;
    muted: string;
    redDark: string;
    shadow: string;
    selected: string;
    disabled: string;
    placeholder: string;
  };
};

export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  stylesFn: (theme: AppTheme) => T
) => {
  const theme = useTheme() as AppTheme;
  return useMemo(() => StyleSheet.create(stylesFn(theme)), [theme]);
};

export const useColors = () => {
  const theme = useTheme() as AppTheme;
  return theme.colors;
};
