import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import React from "react";
import colors from "constants/colors";
import { buttonColor, ButtonType } from "modules/buttons";

type CustomButtonType = {
  onPress?: () => void;
  title: string;
  style?: ViewStyle;
  type?: ButtonType;
  outline?: boolean;
};

const getButtonStyle = (type: ButtonType, outline: boolean) => {
  return {
    backgroundColor: outline ? "transparent" : buttonColor[type],
    borderColor: buttonColor[type],
  };
};

const CustomButton: React.FC<CustomButtonType> = ({
  onPress,
  title,
  style,
  type = "primary",
  outline = false,
}) => {
  const buttonStyle = getButtonStyle(type, outline);
  const color = buttonColor[type];
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, buttonStyle, style]} activeOpacity={0.5}>
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
