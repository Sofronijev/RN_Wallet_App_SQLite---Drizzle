import { StyleSheet, View } from "react-native";
import React from "react";
import colors from "constants/colors";

type SeparatorProps = {
  offset?: number;
};

const Separator: React.FC<SeparatorProps> = ({ offset }) => {
  const marginLeft ={ marginLeft: offset };
  return <View style={[styles.border, !!offset && marginLeft]}></View>;
};

export default Separator;

const styles = StyleSheet.create({
  border: {
    borderBottomWidth: 1,
    borderColor: colors.grey,
  },
});
