import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import React from "react";
import colors from "constants/colors";
import { buttonColor, ButtonType } from "modules/buttons";
import { useAppTheme } from "app/theme/ThemeContext";
import { AppTheme } from "app/theme/useThemedStyles";

type CustomButtonType = {
  onPress?: () => void;
  title: string;
  style?: ViewStyle;
  type?: ButtonType;
  outline?: boolean;
};

const getButtonStyle = (type: ButtonType, outline: boolean, theme: AppTheme) => {
  return {
    backgroundColor: outline ? "transparent" : buttonColor(theme)[type],
    borderColor: buttonColor(theme)[type],
  };
};

const CustomButton: React.FC<CustomButtonType> = ({
  onPress,
  title,
  style,
  type = "primary",
  outline = false,
}) => {
  const { theme } = useAppTheme();
  const buttonStyle = getButtonStyle(type, outline, theme);
  const color = buttonColor(theme)[type];
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, buttonStyle, style]}
      activeOpacity={0.5}
    >
      <Text style={[styles.text, outline && { color }]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
  },
  text: {
    color: colors.white,
    fontSize: 15,
    textTransform: "uppercase",
  },
});
