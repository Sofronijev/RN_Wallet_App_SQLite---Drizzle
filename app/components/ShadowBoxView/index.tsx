import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import React from "react";
import { View, StyleSheet, Platform, ViewProps } from "react-native";

const ShadowBoxView: React.FC<ViewProps> = ({ children, style, ...props }) => {
  const styles = useThemedStyles(themedStyles);
  return (
    <View
      style={[styles.box, Platform.OS === "ios" ? styles.iosShadow : styles.androidShadow, style]}
      {...props}
    >
      {children}
    </View>
  );
};

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    box: {
      borderRadius: 10,
      backgroundColor: theme.colors.card,
      overflow: Platform.OS === "ios" ? "visible" : "hidden",
      borderWidth: theme.dark ? 2 : 1,
      borderColor: theme.dark ? "rgba(255, 255, 255, 0.1)" : "transparent",
      shadowColor: theme.colors.shadow,
    },
    iosShadow: {
      shadowOpacity: theme.dark ? 0.4 : 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    androidShadow: {
      elevation: theme.dark ? 3 : 2,
    },
  });

export default ShadowBoxView;
