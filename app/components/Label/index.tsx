import { Text, TextProps } from "react-native";
import React from "react";

const Label: React.FC<TextProps> = ({ children, ...props }) => {
  return <Text {...props}>{children}</Text>;
};

export default Label;
