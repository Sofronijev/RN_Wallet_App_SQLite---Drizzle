import React, { FC } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import ListLabel from "components/Lists/ListLabel";
import CategoryFilterItem from "./CategoryFilterItem";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import { useGetCategories } from "app/queries/categories";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTransactionFilters } from "./context/TransactionFiltersContext";
import { objectKeys } from "modules/utils";
import Label from "components/Label";
import { transactionStrings } from "constants/strings";

const TransactionFilters: FC = () => {
  const styles = useThemedStyles(themeStyles);
  const colors = useColors();
  const { openSheet } = useActionSheet();
  const { categoriesById } = useGetCategories();
  const { onCategoriesSelect, selectedCategories, onCategoryDelete, onTypeSelect, selectedTypes, resetFilters } =
    useTransactionFilters();

  const pickCategories = () => {
    openSheet({
      type: SHEETS.CATEGORY_PICKER,
      props: {
        onSelect: (data) => onCategoriesSelect(data),
        multiple: true,
        initialSelected: selectedCategories,
      },
    });
  };

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.categoryLabel} onPress={pickCategories}>
          <ListLabel>{"Category"}</ListLabel>
          <MaterialIcons name='add' size={30} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.categoryContainer}>
          {objectKeys(selectedCategories).map((categoryId) => {
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
      <TouchableOpacity onPress={resetFilters}>
        <Label style={styles.resetButton}>{transactionStrings.resetFilters}</Label>
      </TouchableOpacity>
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
    resetButton: {
      padding: 16,
      textAlign: "center",
      fontSize: 20,
      backgroundColor: theme.colors.cardInner,
      fontWeight: "600",
    },
  });

export default TransactionFilters;
