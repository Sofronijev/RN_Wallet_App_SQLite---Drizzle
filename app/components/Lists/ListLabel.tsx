import { StyleSheet, TextProps } from "react-native";
import React, { FC, PropsWithChildren } from "react";
import Label from "components/Label";

type Props = TextProps;

const ListLabel: FC<PropsWithChildren<Props>> = ({ children, style, ...props }) => {
  return (
    <Label style={[styles.text, style]} {...props}>
      {children}
    </Label>
  );
};

export default ListLabel;

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontWeight: "500",
    paddingHorizontal: 16,
  },
});
