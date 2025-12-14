import React, { FC, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import ListLabel from "components/Lists/ListLabel";
import CategoryFilterItem from "./CategoryFilterItem";
import { CategoriesWithType } from "db";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import { useGetCategories } from "app/queries/categories";
import { SafeAreaView } from "react-native-safe-area-context";

const TransactionFilters: FC = () => {
  const styles = useThemedStyles(themeStyles);
  const colors = useColors();
  const { openSheet } = useActionSheet();
  const { categoriesById } = useGetCategories();
  const [selectedCategories, setSelectedCategories] = useState<
    Record<CategoriesWithType["id"], boolean>
  >({});
  const selectedArray = Object.keys(selectedCategories);

  const [selectedTypes, setSelectedTypes] = useState<Record<number, Record<number, boolean>>>({});

  const pickCategories = () => {
    openSheet({
      type: SHEETS.CATEGORY_PICKER,
      props: {
        onSelect: (data) => setSelectedCategories(data),
        multiple: true,
        initialSelected: selectedCategories,
      },
    });
  };

  const onCategoryDelete = (id: number) => {
    setSelectedCategories((prev) => {
      const { [id]: _deleted, ...rest } = prev;
      return rest;
    });
    setSelectedTypes((prev) => {
      const { [id]: _deleted, ...rest } = prev;
      return rest;
    });
  };

  const onTypeSelect = (categoryId: number, typeId: number) => {
    setSelectedTypes((prev) => {
      const categoryTypes = prev[categoryId] ?? {};

      // ako je već selektovan → ukloni
      if (categoryTypes[typeId]) {
        const { [typeId]: _removed, ...restTypes } = categoryTypes;

        return {
          ...prev,
          [categoryId]: restTypes,
        };
      }

      return {
        ...prev,
        [categoryId]: {
          ...categoryTypes,
          [typeId]: true,
        },
      };
    });
  };

  return (
    <SafeAreaView edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.categoryLabel} onPress={pickCategories}>
          <ListLabel>{"Category"}</ListLabel>
          <MaterialIcons name='add' size={30} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.categoryContainer}>
          {selectedArray.map((categoryId) => {
            const category = categoriesById[+categoryId];
            return (
              <CategoryFilterItem
                key={category.id}
                category={category}
                onDelete={onCategoryDelete}
                selectedTypes={selectedTypes[category.id]}
                onTypeSelect={onTypeSelect}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingVertical: 32,
      paddingHorizontal: 16,
    },
    categoryContainer: {
      gap: 8,
    },
    categoryLabel: { flexDirection: "row", paddingBottom: 16 },
  });

export default TransactionFilters;
