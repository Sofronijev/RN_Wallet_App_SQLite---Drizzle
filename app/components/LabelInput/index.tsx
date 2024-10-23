import { TextInput, TextInputProps } from "react-native";
import React from "react";

const LabelInput: React.FC<TextInputProps> = (props) => {
  return <TextInput {...props} />;
};

export default LabelInput;
