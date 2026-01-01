import { ActivityIndicator, StyleSheet } from "react-native";
import React from "react";
import colors from "constants/colors";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

type AppActivityIndicatorProps = {
  isLoading: boolean;
  hideScreen?: boolean;
  size?: number | "large" | "small" | undefined;
};

const AppActivityIndicator: React.FC<AppActivityIndicatorProps> = ({
  isLoading,
  hideScreen,
  size = "large",
}) => {
  const tStyles = useThemedStyles(styles);
  if (!isLoading) return null;
  return (
    <ActivityIndicator
      style={[tStyles.activityIndicator, hideScreen && tStyles.hideScreen]}
      size={size}
      color={colors.greenMint}
    />
  );
};

export default AppActivityIndicator;

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    activityIndicator: {
      ...StyleSheet.absoluteFillObject,
    },
    hideScreen: {
      backgroundColor: theme.colors.background,
      opacity: 1,
    },
  });
