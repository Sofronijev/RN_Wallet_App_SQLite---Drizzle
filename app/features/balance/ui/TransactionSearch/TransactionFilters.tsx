import React, { FC, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useGetCategories } from "app/queries/categories";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import ListLabel from "components/Lists/ListLabel";
import CategoryFilterItem from "./CategoryFilterItem";
import { CategoriesWithType } from "db";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";

const TransactionFilters: FC = () => {
  const styles = useThemedStyles(themeStyles);
  const colors = useColors();
  const { data: categories } = useGetCategories();
  const { openSheet } = useActionSheet();

  const [selectedCategories, setSelectedCategories] = useState<Record<string, CategoriesWithType>>(
    {}
  );
  const categoriesArray = Object.values(selectedCategories);

  const pickCategories = () => {
    openSheet({ type: SHEETS.CATEGORY_PICKER, props: { onSelect: () => undefined } });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.categoryLabel} onPress={pickCategories}>
        <ListLabel>{"Category"}</ListLabel>
        <MaterialIcons name='add' size={30} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.categoryContainer}>
        {categoriesArray.map((category) => (
          <CategoryFilterItem category={category} />
        ))}
      </View>
    </ScrollView>
  );
};

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: 32,
      paddingHorizontal: 16,
    },
    categoryContainer: {
      gap: 8,
    },
    categoryLabel: { flexDirection: "row", paddingBottom: 16 },
  });

export default TransactionFilters;
