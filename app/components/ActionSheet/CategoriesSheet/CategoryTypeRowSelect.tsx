import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Category, Transaction } from "modules/transactionCategories";

type Props = {
  item: Transaction | Category;
  onPress: (item: Transaction | Category) => void;
};

const CategoryTypeRowSelect: React.FC<Props> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
    <Text style={styles.label}>{item.label}</Text>
  </TouchableOpacity>
);

export default CategoryTypeRowSelect;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },
  label: {
    fontSize: 16,
    paddingVertical: 10,
  },
});
