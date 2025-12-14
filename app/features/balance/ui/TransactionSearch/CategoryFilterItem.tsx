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

type Props = {
  category: CategoriesWithType;
  onDelete: (id: number) => void;
  selectedTypes?: Record<number, boolean>;
  onTypeSelect: (categoryId: number, typeId: number) => void;
};

const TYPE_ITEM_HEIGHT = 30;

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
    <View>
      <TouchableWithoutFeedback onPress={toggleOpen}>
        <View style={styles.category}>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => onDelete(category.id)} hitSlop={8}>
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
    </View>
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
      backgroundColor: theme.colors.cardInner,
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
    },
    typeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      height: TYPE_ITEM_HEIGHT,
    },
    typesNum: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      color: colors.white,
      fontWeight: "bold",
    },
  });
