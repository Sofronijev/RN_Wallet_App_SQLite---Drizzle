import { TextInputProps, View, ViewStyle } from "react-native";
import React from "react";
import StyledLabelInput from "components/StyledLabelInput";

type TextBoxProps = TextInputProps & { style?: ViewStyle };

const TextBox: React.FC<TextBoxProps> = ({ style, ...props }) => {
  return (
    <View style={style}>
      <StyledLabelInput {...props} multiline textAlignVertical='top' />
    </View>
  );
};

export default TextBox;

