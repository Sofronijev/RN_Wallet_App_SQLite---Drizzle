import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React, { memo } from "react";
import CategoryIcon from "components/CategoryIcon";
import { CategoriesWithType } from "db";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

type CategoryItemProps = {
  onPress: (item: CategoriesWithType) => void;
  item: CategoriesWithType;
};

const CategoryItem: React.FC<CategoryItemProps> = ({ onPress, item }) => {
  const styles = useThemedStyles(themeStyles);
  const { iconColor, iconFamily, name, iconName } = item;
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <CategoryIcon iconSize={35} color={iconColor} iconFamily={iconFamily} name={iconName} />
      <Text numberOfLines={1} style={styles.label}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};
export default memo(CategoryItem);

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
    },
    label: {
      fontSize: 13,
      color: theme.colors.text,
    },
  });
