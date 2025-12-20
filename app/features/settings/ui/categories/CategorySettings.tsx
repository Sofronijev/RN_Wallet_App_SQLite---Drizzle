import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useGetCategories } from "app/queries/categories";
import ShadowBoxView from "components/ShadowBoxView";
import { getCategoryIcon } from "components/CategoryIcon";
import colors from "constants/colors";
import { useColors } from "app/theme/useThemedStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import Label from "components/Label";
import TypeSelector from "app/features/balance/ui/TransactionForm/TypeSelector";

const keyExtractor = (item: number) => `${item}`;

const CategorySettings: React.FC = () => {
  const { categoriesById, categoriesAllId } = useGetCategories();
  const { text, disabled } = useColors();

  const canDeleteCategory = categoriesAllId.length > 0;

  const onDeleteCategory = () => {};

  const renderItem = ({ item }: { item: number }) => {
    const category = categoriesById[item];
    if (!category) return null;
    const { types, iconColor, iconFamily, iconName, name } = category;
    const renderIcon = getCategoryIcon({
      color: colors.white,
      iconFamily,
      name: iconName,
      iconSize: 36,
    });

    return (
      <TouchableWithoutFeedback style={styles.flex}>
        <ShadowBoxView style={styles.itemContainer}>
          <View style={[styles.icon, { backgroundColor: iconColor }]}>{renderIcon}</View>
          <View style={styles.flex}>
            <View style={styles.row}>
              <Label style={styles.label}>{name}</Label>
              <TouchableOpacity onPress={onDeleteCategory} disabled={!canDeleteCategory}>
                <MaterialIcons
                  name='delete-outline'
                  size={24}
                  color={canDeleteCategory ? text : disabled}
                />
              </TouchableOpacity>
            </View>
            <TypeSelector types={types} disableSelect />
          </View>
        </ShadowBoxView>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]}>
      <View>
        <FlatList
          contentContainerStyle={styles.container}
          data={categoriesAllId}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      </View>
    </SafeAreaView>
  );
};

export default CategorySettings;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  icon: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  itemContainer: {
    marginVertical: 8,
    flexDirection: "row",
    marginHorizontal: 16,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  label: {
    fontSize: 18,
  },
  row: {
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});
