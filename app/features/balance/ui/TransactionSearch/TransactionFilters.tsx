import React, { FC, useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import ListLabel from "components/Lists/ListLabel";
import CategoryFilterItem from "./CategoryFilterItem";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import { useGetCategories } from "app/queries/categories";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SelectedCategories,
  SelectedTypes,
  useTransactionFilters,
} from "./context/TransactionFiltersContext";
import { objectKeys } from "modules/utils";
import { dialogStrings } from "constants/strings";
import { useNavigation } from "@react-navigation/native";
import HeaderTextButton from "components/Header/HeaderTextButton";
import CustomButton from "components/CustomButton";

const TransactionFilters: FC = () => {
  const navigation = useNavigation();
  const styles = useThemedStyles(themeStyles);
  const colors = useColors();
  const { openSheet } = useActionSheet();
  const { categoriesById } = useGetCategories();
  const { applyFilters, filters } = useTransactionFilters();
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>(
    filters.categories
  );
  const [selectedTypes, setSelectedTypes] = useState<SelectedTypes>(filters.types);

  const onApply = () => {
    applyFilters({
      categories: selectedCategories,
      types: selectedTypes,
    });
    navigation.goBack();
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderTextButton onPress={resetFilters}>{dialogStrings.reset}</HeaderTextButton>
      ),
    });
  }, [onApply]);

  const onCategoriesSelect = useCallback((data: SelectedCategories) => {
    setSelectedCategories(data);
  }, []);

  const onCategoryDelete = useCallback((id: number) => {
    setSelectedCategories((prev) => {
      const { [id]: _deleted, ...rest } = prev;
      return rest;
    });
    setSelectedTypes((prev) => {
      const { [id]: _deleted, ...rest } = prev;
      return rest;
    });
  }, []);

  const onTypeSelect = useCallback((categoryId: number, typeId: number) => {
    setSelectedTypes((prev) => {
      const categoryTypes = prev[categoryId] ?? {};

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
  }, []);

  const resetFilters = () => {
    setSelectedCategories({});
    setSelectedTypes({});
  };

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

      <CustomButton title={dialogStrings.apply} onPress={onApply} style={styles.applyButton} />
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
    applyButton: {
      marginBottom: 8,
    },
  });

export default TransactionFilters;
