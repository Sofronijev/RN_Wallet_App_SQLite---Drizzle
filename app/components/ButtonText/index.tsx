import { TextStyle, TouchableOpacity, ViewStyle } from "react-native";
import React from "react";
import { buttonColor, ButtonType } from "modules/buttons";
import Label from "components/Label";
import colors from "constants/colors";

type ButtonTextProps = {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  type?: ButtonType;
  buttonStyle?: TextStyle;
  disabled?: boolean;
};

const ButtonText: React.FC<ButtonTextProps> = ({
  onPress,
  title,
  style,
  buttonStyle,
  type = "primary",
  disabled,
}) => {
  const color = disabled ? colors.disabled : buttonColor[type];
  return (
    <TouchableOpacity onPress={onPress} style={style} disabled={disabled}>
      <Label style={[{ color }, buttonStyle]}>{title}</Label>
    </TouchableOpacity>
  );
};

export default ButtonText;
