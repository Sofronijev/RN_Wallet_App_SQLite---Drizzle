import { Alert, FlatList, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useDeleteCategoryMutation, useGetCategories } from "app/queries/categories";
import ShadowBoxView from "components/ShadowBoxView";
import { getCategoryIcon } from "components/CategoryIcon";
import colors from "constants/colors";
import { useColors } from "app/theme/useThemedStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import Label from "components/Label";
import TypeSelector from "app/features/balance/ui/TransactionForm/TypeSelector";
import { CategoryNumber } from "modules/categories";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";

const keyExtractor = (item: number) => `${item}`;

const CategorySettings: React.FC = () => {
  const { categoriesById, categoriesAllId } = useGetCategories();
  const { deleteCategory } = useDeleteCategoryMutation();
  const { text, disabled } = useColors();
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const atLeastOneCategory = categoriesAllId.length > 1;

  const renderItem = ({ item }: { item: number }) => {
    const category = categoriesById[item];
    if (!category) return null;
    const { types, id, iconColor, iconFamily, iconName, name } = category;
    const renderIcon = getCategoryIcon({
      color: colors.white,
      iconFamily,
      name: iconName,
      iconSize: 36,
    });
    const isBalanceCorrCategory = category.id === CategoryNumber.balanceCorrection;

    const openFormScreen = () => {
      if (isBalanceCorrCategory) {
        Alert.alert(
          "Cannot edit this category",
          "This category is important for the app to track your balance and cannot be edited or deleted."
        );
      } else {
        navigation.navigate("CategoryForm", { id });
      }
    };

    return (
      <Pressable onPress={openFormScreen}>
        <ShadowBoxView style={styles.itemContainer}>
          <View style={[styles.icon, { backgroundColor: iconColor }]}>{renderIcon}</View>
          <View style={styles.flex}>
            <View style={styles.row}>
              <Label style={styles.label}>{name}</Label>
              {!isBalanceCorrCategory && (
                <TouchableOpacity onPress={() => deleteCategory(id)} disabled={!atLeastOneCategory}>
                  <MaterialIcons
                    name='delete-outline'
                    size={24}
                    color={atLeastOneCategory ? text : disabled}
                  />
                </TouchableOpacity>
              )}
            </View>
            {!!types.length && <TypeSelector types={types} disableSelect />}
          </View>
        </ShadowBoxView>
      </Pressable>
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
    width: 100,
    alignItems: "center",
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
    fontWeight: "500",
  },
  row: {
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});
