import { StyleSheet } from "react-native";
import React from "react";
import Label from "components/Label";
import HeaderIcon from "./HeaderIcon";

type HeaderTextButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
};

const HeaderTextButton: React.FC<HeaderTextButtonProps> = ({ onPress, children }) => {
  return (
    <HeaderIcon onPress={onPress}>
      <Label style={styles.label}>{children}</Label>
    </HeaderIcon>
  );
};

export default HeaderTextButton;

const styles = StyleSheet.create({
  label: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
