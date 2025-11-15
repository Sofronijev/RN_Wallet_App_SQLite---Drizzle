import { StyleProp, StyleSheet, TextInputProps, TextStyle, View } from "react-native";
import React from "react";
import LabelInput from "components/LabelInput";
import Label from "components/Label";
import ShadowBoxView from "components/ShadowBoxView";

type StyledLabelInputType = TextInputProps & {
  icon?: React.ReactElement;
  style?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  rightText?: string | null;
};

const StyledLabelInput: React.FC<StyledLabelInputType> = ({
  icon,
  style,
  inputStyle,
  disabled,
  rightText,
  ...props
}) => {
  return (
    <ShadowBoxView style={[styles.container, style]} pointerEvents={disabled ? "none" : "auto"}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <LabelInput style={[styles.input, inputStyle]} editable={!disabled} {...props} />
      {rightText && <Label style={styles.rightText}>{rightText}</Label>}
    </ShadowBoxView>
  );
};

export default StyledLabelInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    paddingLeft: 10,
  },
  input: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flex: 1,
    fontSize: 15,
  },
  rightText: {
    paddingRight: 12,
  },
});
