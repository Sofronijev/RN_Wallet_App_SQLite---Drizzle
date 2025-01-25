import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import { CategoryType } from "db";
import Separator from "components/Separator";

type Props = {
  item: CategoryType;
  onPress: (item: CategoryType) => void;
};

const CategoryTypeRowSelect: React.FC<Props> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
    <Text style={styles.label}>{item.name}</Text>
    <Separator />
  </TouchableOpacity>
);

export default CategoryTypeRowSelect;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  label: {
    fontSize: 16,
    paddingVertical: 10,
  },
});
