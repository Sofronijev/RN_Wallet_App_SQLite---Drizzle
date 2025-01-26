import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Type } from "db";
import colors from "constants/colors";

type Props = {
  item: Type;
  onPress: (item: Type) => void;
};

const CategoryTypeRowSelect: React.FC<Props> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
    <Text style={styles.label}>{item.name}</Text>
  </TouchableOpacity>
);

export default CategoryTypeRowSelect;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 5,
    borderColor: colors.grey,
  },
  label: {
    fontSize: 16,
    paddingVertical: 8,
    textAlign: "center",
  },
});
