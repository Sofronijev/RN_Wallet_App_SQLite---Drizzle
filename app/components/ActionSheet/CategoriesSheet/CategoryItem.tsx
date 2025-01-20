import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import CategoryIcon from "components/CategoryIcon";
import { Category, Transaction } from "modules/transactionCategories";
import { CATEGORIES_NUMBER_OF_ROWS } from "app/features/balance/modules/transaction";

export const CATEGORY_ITEM_HEIGHT = 85;
const categoryWidth = 100 / CATEGORIES_NUMBER_OF_ROWS;

type CategoryItemProps = {
  item: Transaction | Category;
  onPress: (item: Transaction | Category) => void;
};

const CategoryItem: React.FC<CategoryItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <CategoryIcon categoryName={item.name} iconSize={40} />
      <Text numberOfLines={1} style={styles.label}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};
export default CategoryItem;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 5,
    height: CATEGORY_ITEM_HEIGHT,
    width: `${categoryWidth}%`,
  },
  label: {
    fontSize: 13,
  },
});
