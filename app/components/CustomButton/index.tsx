import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
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
  isLoading?: boolean;
  disabled?: boolean;
  size?: "normal" | "small";
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
  isLoading,
  disabled,
  size = "normal",
}) => {
  const { theme } = useAppTheme();
  const buttonStyle = getButtonStyle(type, outline, theme);

  const sizeStyle =
    size === "small"
      ? { paddingVertical: 8, paddingHorizontal: 12 }
      : { paddingVertical: 15, paddingHorizontal: 20 };

  const textStyle = size === "small" ? { fontSize: 13 } : { fontSize: 15 };

  const color = buttonColor(theme)[type];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, buttonStyle, sizeStyle, style]}
      activeOpacity={0.5}
      disabled={disabled}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={[styles.text, textStyle, outline && { color }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
  },
  text: {
    color: colors.white,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
});
