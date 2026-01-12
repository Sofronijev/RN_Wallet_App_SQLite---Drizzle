import { Alert, FlatList, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useDeleteCategoryMutation, useGetCategories } from "app/queries/categories";
import ShadowBoxView from "components/ShadowBoxView";
import CategoryIcon from "components/CategoryIcon";
import { useColors } from "app/theme/useThemedStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import Label from "components/Label";
import TypeSelector from "app/features/balance/ui/TransactionForm/TypeSelector";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { showDeleteCategoryAlert } from "../../modules";
import { addColorOpacity } from "modules/colorHelper";

const keyExtractor = (item: number) => `${item}`;

const CategorySettings: React.FC = () => {
  const { categoriesById, categoriesAllId } = useGetCategories();
  const { deleteCategory } = useDeleteCategoryMutation();
  const { text, disabled } = useColors();
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const onDeleteCategory = (id: number) => {
    showDeleteCategoryAlert(() => deleteCategory(id));
  };

  const renderItem = ({ item }: { item: number }) => {
    const category = categoriesById[item];
    if (!category) return null;
    const { types, id, iconColor, iconFamily, iconName, name } = category;
    const isSystemCategory = category.type === "system";

    const openFormScreen = () => {
      if (isSystemCategory) {
        Alert.alert(
          "Cannot edit this category",
          "This category is required to correctly track your balance and can’t be edited or deleted."
        );
      } else {
        navigation.navigate("CategoryForm", { id });
      }
    };

    return (
      <ShadowBoxView style={styles.cardContent}>
        <Pressable onPress={openFormScreen} style={({ pressed }) => pressed && styles.itemPressed}>
          <View style={styles.headerRow}>
            <View style={styles.leftSection}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: addColorOpacity(iconColor, 0.15),
                    borderColor: addColorOpacity(iconColor, 0.3),
                  },
                ]}
              >
                <CategoryIcon
                  name={iconName}
                  iconFamily={iconFamily}
                  color={iconColor}
                  iconSize={28}
                  plain
                />
              </View>
              <Label style={styles.label}>{name}</Label>
            </View>

            <View style={styles.actionButton}>
              {!isSystemCategory ? (
                <TouchableOpacity
                  onPress={() => onDeleteCategory(id)}
                  style={styles.deleteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons name='delete-outline' size={22} color={text} />
                </TouchableOpacity>
              ) : (
                <View style={styles.lockButton}>
                  <MaterialIcons name='lock-outline' size={20} color={disabled} />
                </View>
              )}
            </View>
          </View>
        </Pressable>
        {types.length > 0 && <View style={styles.divider} />}

        {types.length > 0 && (
          <View style={styles.typesContainer}>
            <TypeSelector types={types} disableSelect categoryId={category.id} />
          </View>
        )}
      </ShadowBoxView>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.container}
        data={categoriesAllId}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default CategorySettings;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  itemPressed: {
    opacity: 0.7,
  },
  cardContent: {
    paddingVertical: 8,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  actionButton: {
    marginLeft: 8,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  lockButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  typesContainer: {
    marginTop: 4,
  },
});
