import colors from "constants/colors";
import React from "react";
import { View, StyleSheet, Platform, ViewStyle, StyleProp, ViewProps } from "react-native";

const ShadowBoxView: React.FC<ViewProps> = ({ children, style }) => {
  return (
    <View
      style={[styles.box, Platform.OS === "ios" ? styles.iosShadow : styles.androidShadow, style]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    borderRadius: 10,
    backgroundColor: colors.white,
    overflow: Platform.OS === "ios" ? "visible" : "hidden",
    borderWidth: 1,
    borderColor: colors.white,
  },
  iosShadow: {
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  androidShadow: {
    elevation: 4,
    shadowColor: colors.black,
  },
});

export default ShadowBoxView;
