import { TextInput, TextInputProps, StyleSheet } from "react-native";
import React from "react";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

const LabelInput: React.FC<TextInputProps> = ({ style, placeholderTextColor, ...props }) => {
  const styles = useThemedStyles(themeStyles);
  return (
    <TextInput
      {...props}
      placeholderTextColor={placeholderTextColor ?? styles.placeholder.color}
      style={[styles.input, style]}
    />
  );
};

export default LabelInput;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    input: {
      color: theme.colors.text,
    },
    placeholder: {
      color: theme.colors.placeholder,
    },
  });
