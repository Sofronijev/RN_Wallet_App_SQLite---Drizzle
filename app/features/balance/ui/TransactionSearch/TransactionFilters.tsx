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
        <View style={styles.section}>
          <ListLabel style={styles.sectionLabel}>Categories</ListLabel>

          <TouchableOpacity style={styles.addButton} onPress={pickCategories} activeOpacity={0.7}>
            <MaterialIcons name='add-circle-outline' size={24} color={colors.primary} />
            <ListLabel style={styles.addButtonText}>Add Category</ListLabel>
          </TouchableOpacity>
        </View>

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

      <View style={styles.applyButton}>
        <CustomButton title={dialogStrings.apply} onPress={onApply} />
      </View>
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
      paddingHorizontal: 16,
      borderTopWidth: 1,
      paddingTop: 12,
      borderColor: theme.colors.border,
    },
    section: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 13,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      opacity: 0.6,
      marginBottom: 12,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      borderStyle: "dashed",
    },
    addButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default TransactionFilters;
