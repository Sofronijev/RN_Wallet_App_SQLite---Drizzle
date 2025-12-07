import { Text, TextProps } from "react-native";
import React from "react";
import { useColors } from "app/theme/useThemedStyles";

const Label: React.FC<TextProps> = ({ children, style, ...props }) => {
  const { text } = useColors();
  return (
    <Text style={[{ color: text }, style]} {...props}>
      {children}
    </Text>
  );
};

export default Label;
