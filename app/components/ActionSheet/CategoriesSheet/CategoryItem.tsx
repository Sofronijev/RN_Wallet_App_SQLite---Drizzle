import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React, { memo } from "react";
import CategoryIcon from "components/CategoryIcon";
import { CATEGORIES_NUMBER_OF_ROWS, CATEGORY_ITEM_HEIGHT } from "app/features/balance/modules/transaction";
import { CategoriesWithType } from "db";

const categoryWidth = 100 / CATEGORIES_NUMBER_OF_ROWS;

type CategoryItemProps = {
  onPress: (item: CategoriesWithType) => void;
  item: CategoriesWithType;
};

const CategoryItem: React.FC<CategoryItemProps> = ({ onPress, item }) => {
  const { iconColor, iconFamily, name, iconName } = item;
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <CategoryIcon iconSize={45} color={iconColor} iconFamily={iconFamily} name={iconName} />
      <Text numberOfLines={1} style={styles.label}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};
export default memo(CategoryItem);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: `${categoryWidth}%`,
    height: CATEGORY_ITEM_HEIGHT,
  },
  label: {
    fontSize: 13,
  },
});
