import { TextStyle, TouchableOpacity, ViewStyle } from "react-native";
import React from "react";
import { buttonColor, ButtonType } from "modules/buttons";
import Label from "components/Label";

type ButtonTextProps = {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  type?: ButtonType;
  buttonStyle?: TextStyle;
};

const ButtonText: React.FC<ButtonTextProps> = ({
  onPress,
  title,
  style,
  buttonStyle,
  type = "primary",
}) => {
  const color = buttonColor[type];
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Label style={[{ color }, buttonStyle]}>{title}</Label>
    </TouchableOpacity>
  );
};

export default ButtonText;
