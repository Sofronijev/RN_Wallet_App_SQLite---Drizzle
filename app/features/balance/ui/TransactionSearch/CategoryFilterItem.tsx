import { View, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { CategoriesWithType } from "db";
import CategoryIcon from "components/CategoryIcon";
import Label from "components/Label";
import AppCheckbox from "components/AppCheckbox";

type Props = {
  category: CategoriesWithType;
  onDelete: (id: number) => void;
  selectedTypes?: Record<number, boolean>;
  onTypeSelect: (categoryId: number, typeId: number) => void;
};

const CategoryFilterItem: React.FC<Props> = ({
  category,
  onDelete,
  selectedTypes,
  onTypeSelect,
}) => {
  const styles = useThemedStyles(themeStyles);
  const colors = useColors();
  const deleteCategory = () => {
    onDelete(category.id);
  };
  return (
    <View>
      <TouchableOpacity key={category.id} style={styles.category}>
        <View style={styles.row}>
          <TouchableOpacity onPress={deleteCategory}>
            <MaterialIcons name='close' size={20} color={colors.muted} />
          </TouchableOpacity>
          <CategoryIcon
            iconSize={16}
            color={category.iconColor}
            iconFamily={category.iconFamily}
            name={category.iconName}
          />
          <Label>{category.name}</Label>
        </View>
        <TouchableOpacity onPress={deleteCategory}>
          <MaterialIcons name='chevron-right' size={30} color={colors.muted} />
        </TouchableOpacity>
      </TouchableOpacity>
      <View style={styles.types}>
        {category.types.map((type) => {
          return (
            <TouchableOpacity
              style={styles.row}
              key={type.id}
              onPress={() => onTypeSelect(category.id, type.id)}
            >
              <AppCheckbox isChecked={selectedTypes?.[type.id]} pointerEvents='none' />
              <Label>{type.name}</Label>
            </TouchableOpacity>
          );
        })}
      </View>
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
    types: {
      paddingHorizontal: 32,
      paddingVertical: 8,
      gap: 4,
    },
  });
