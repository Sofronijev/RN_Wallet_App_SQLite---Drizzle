import React from "react";
import { View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";

import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { CategoriesWithType } from "db";
import CategoryIcon from "components/CategoryIcon";
import Label from "components/Label";
import AppCheckbox from "components/AppCheckbox";
import colors from "constants/colors";
import ShadowBoxView from "components/ShadowBoxView";
import Separator from "components/Separator";

type Props = {
  category: CategoriesWithType;
  onDelete: (id: number) => void;
  selectedTypes?: Record<number, boolean>;
  onTypeSelect: (categoryId: number, typeId: number) => void;
};

const TYPE_ITEM_HEIGHT = 40;

const CategoryFilterItem: React.FC<Props> = ({
  category,
  onDelete,
  selectedTypes,
  onTypeSelect,
}) => {
  const styles = useThemedStyles(themeStyles);
  const colors = useColors();
  const selectedNum = selectedTypes ? Object.keys(selectedTypes).length : 0;
  const isOpen = useSharedValue(0);

  const toggleOpen = () => {
    isOpen.value = withTiming(isOpen.value === 0 ? 1 : 0, { duration: 200 });
  };

  const chevronStyle = useAnimatedStyle(() => {
    const rotate = interpolate(isOpen.value, [0, 1], [0, 90]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  const typesStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(isOpen.value ? category.types.length * TYPE_ITEM_HEIGHT : 0, {
        duration: 200,
      }),
      opacity: withTiming(isOpen.value ? 1 : 0, { duration: 200 }),
      overflow: "hidden",
    };
  });

  return (
    <ShadowBoxView>
      <TouchableWithoutFeedback onPress={toggleOpen}>
        <View style={styles.category}>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => onDelete(category.id)}
              hitSlop={12}
              style={styles.deleteButton}
            >
              <MaterialIcons name='close' size={20} color={colors.muted} />
            </TouchableOpacity>

            <CategoryIcon
              iconSize={16}
              color={category.iconColor}
              iconFamily={category.iconFamily}
              name={category.iconName}
            />

            <View style={styles.textContent}>
              <Label style={styles.categoryName}>{category.name}</Label>
              {category.types.length > 0 && (
                <Label style={styles.typeCount}>
                  {category.types.length}{" "}
                  {category.types.length === 1 ? "subcategory" : "subcategories"}
                </Label>
              )}
            </View>
          </View>
          <View style={styles.row}>
            {!!selectedNum && <Label style={styles.typesNum}>{selectedNum}</Label>}

            <View hitSlop={8}>
              <Animated.View style={chevronStyle}>
                <MaterialIcons name='chevron-right' size={30} color={colors.muted} />
              </Animated.View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.types, typesStyle]}>
        {category.types.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={styles.typeRow}
            onPress={() => onTypeSelect(category.id, type.id)}
          >
            <AppCheckbox isChecked={!!selectedTypes?.[type.id]} pointerEvents='none' />
            <Label>{type.name}</Label>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </ShadowBoxView>
  );
};

export default CategoryFilterItem;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    category: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      backgroundColor: theme.colors.card,
      borderRadius: 8,
      padding: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    types: {
      paddingHorizontal: 32,
      overflow: "hidden",
      borderTopWidth: 1,
      borderColor: theme.colors.border,
    },
    typeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      height: TYPE_ITEM_HEIGHT,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    typesNum: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      color: colors.white,
      fontWeight: "bold",
    },
    deleteButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.cardInner,
      alignItems: "center",
      justifyContent: "center",
    },
    textContent: {
      gap: 2,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: "600",
    },
    typeCount: {
      fontSize: 13,
      opacity: 0.5,
    },
  });
