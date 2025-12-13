import { View, StyleSheet } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { CategoriesWithType } from "db";
import CategoryIcon from "components/CategoryIcon";
import Label from "components/Label";
import AppCheckbox from "components/AppCheckbox";

type Props = {
  category: CategoriesWithType;
};

const CategoryFilterItem: React.FC<Props> = ({ category }) => {
  const styles = useThemedStyles(themeStyles);
  const colors = useColors();

  return (
    <View key={category.id} style={styles.category}>
      <View style={styles.row}>
        <AppCheckbox />
        <CategoryIcon
          iconSize={16}
          color={category.iconColor}
          iconFamily={category.iconFamily}
          name={category.iconName}
        />
        <Label>{category.name}</Label>
      </View>
      <MaterialIcons name='chevron-right' size={30} color={colors.text} />
    </View>
  );
};

export default CategoryFilterItem;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    category: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      backgroundColor: theme.colors.cardInner,
      borderRadius: 8,
      padding: 8,
      justifyContent: "space-between",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
  });
