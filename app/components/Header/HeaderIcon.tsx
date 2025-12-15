import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";

type HeaderIconProps = {
  onPress: () => void;
  children: React.ReactNode;
};

const HeaderIcon: React.FC<HeaderIconProps> = ({ onPress, children }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

export default HeaderIcon;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
  },
});
