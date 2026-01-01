import React, { FC, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import CategoryItem from "./CategoryItem";
import SheetModal from "../components/SheetModal";
import SheetHeader from "../components/SheetHeader";
import { useGetCategories } from "app/queries/categories";
import { CategoriesWithType } from "db";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import CheckMark from "components/CheckMark";
import { useColors } from "app/theme/useThemedStyles";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";

type Data =
  | {
      multiple?: false;
      onSelect: (categoryId: number) => void;
      initialSelected?: number;
      showNewCategoryButton?: boolean;
    }
  | {
      multiple: true;
      onSelect: (data: Record<CategoriesWithType["id"], boolean>) => void;
      initialSelected?: Record<CategoriesWithType["id"], boolean>;
      showNewCategoryButton?: boolean;
    };

const keyExtractor = <T extends { id: number }>(item: T) => item.id.toString();

export const CATEGORIES_NUMBER_OF_ROWS = 4;

const TransactionBottomSheet: FC<Data> = ({
  onSelect,
  multiple,
  initialSelected,
  showNewCategoryButton,
}) => {
  const sheetRef = useRef<BottomSheetModalMethods | null>(null);
  const { data: categories } = useGetCategories();

  const colors = useColors();
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const addNewButton = {
    id: 0,
    name: "New category",
    type: "system",
    iconFamily: "Ionicons",
    iconName: "add-outline",
    iconColor: colors.border,
  };

  const listData = showNewCategoryButton ? [...categories, addNewButton] : categories;

  const setInitialSelected = () => {
    if (!multiple) return {};
    return initialSelected ?? {};
  };

  const [selected, setSelected] = useState<Record<CategoriesWithType["id"], boolean>>(
    setInitialSelected()
  );

  const onCategoryPress = (item: CategoriesWithType) => {
    if (!multiple) {
      onSelect(item.id);
      sheetRef.current?.close();
    } else {
      setSelected((prev) => {
        if (prev[item.id]) {
          const { [item.id]: _deleted, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [item.id]: true,
        };
      });
    }
  };

  const onChooseMultiple = () => {
    if (multiple) {
      sheetRef.current?.close();
      onSelect(selected);
    }
  };

  const openCreateCategory = () => {
    sheetRef.current?.close();
    navigation.navigate("CategoryForm");
  };

  const renderItem = ({ item }: { item: CategoriesWithType }) => {
    const isSelected = multiple ? selected[item.id] : initialSelected === item.id;
    const isNewCategoryButton = showNewCategoryButton && item.id === 0;

    if (isNewCategoryButton) {
      return (
        <View style={styles.item}>
          <CategoryItem item={item} onPress={openCreateCategory} />
        </View>
      );
    }

    return (
      <View style={styles.item}>
        <CategoryItem item={item} onPress={onCategoryPress} />
        {isSelected && <CheckMark position={{ top: 35, right: 10 }} />}
      </View>
    );
  };

  // BUG - IOS BUG - On first render, clicking on category will close sheet and not show the types (looks like it disappears), after that it will work normally
  // BUG - when there is textInput with autofocus prop the bottom sheet will open - FIXED with setting "softwareKeyboardLayoutMode": "pan" in app.json
  return (
    <SheetModal sheetRef={sheetRef}>
      <BottomSheetFlatList
        numColumns={CATEGORIES_NUMBER_OF_ROWS}
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        contentContainerStyle={styles.container}
        ListHeaderComponent={() => (
          <SheetHeader
            title={multiple ? "Pick categories" : "Pick category"}
            nextText={multiple ? "Choose" : undefined}
            onNext={onChooseMultiple}
          />
        )}
        stickyHeaderIndices={[0]}
      />
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingBottom: 16,
    gap: 4,
  },
  item: {
    flexBasis: `${100 / CATEGORIES_NUMBER_OF_ROWS}%`,
    alignItems: "center",
  },
});

export default TransactionBottomSheet;
