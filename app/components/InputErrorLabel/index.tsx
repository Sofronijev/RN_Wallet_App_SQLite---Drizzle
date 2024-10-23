import { StyleSheet } from "react-native";
import React from "react";
import colors from "constants/colors";
import Label from "components/Label";

type InputErrorLabelType = {
  text: string | undefined;
  isVisible: boolean;
};

const InputErrorLabel: React.FC<InputErrorLabelType> = ({ text, isVisible }) => {
  if (!isVisible && !text) return null;

  return <Label style={styles.text}>{text}</Label>;
};

export default InputErrorLabel;

const styles = StyleSheet.create({
    text: {
        color: colors.error,
        paddingTop: 3,
    },
})