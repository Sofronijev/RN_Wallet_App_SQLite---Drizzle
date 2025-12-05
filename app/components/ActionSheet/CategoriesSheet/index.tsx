import React, { FC, useRef } from "react";
import { StyleSheet } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import CategoryItem from "./CategoryItem";
import {
  CATEGORIES_NUMBER_OF_ROWS,
  CATEGORY_ITEM_HEIGHT,
} from "app/features/balance/modules/transaction";
import SheetModal, { HANDLE_HEIGHT } from "../components/SheetModal";
import SheetHeader, { HEADER_TEXT_HEIGH } from "../components/SheetHeader";
import { useGetCategories } from "app/queries/categories";
import { CategoriesWithType, Category, Type } from "db";
import { SHEETS } from "../ActionSheetManager";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

const CONTAINER_PADDING = 8;

type Data = {
  onSelect: (category: Category, types: Type[]) => void;
};

const keyExtractor = <T extends { id: number }>(item: T) => item.id.toString();

const TransactionBottomSheet: FC<Data> = ({ onSelect }) => {
  const sheetRef = useRef<BottomSheetModalMethods | null>(null);

  const { data: categories } = useGetCategories();

  const snapPoints = [
    CATEGORY_ITEM_HEIGHT * Math.ceil(categories.length / CATEGORIES_NUMBER_OF_ROWS) +
      HANDLE_HEIGHT +
      HEADER_TEXT_HEIGH +
      CONTAINER_PADDING +
      16,
  ];

  const onCategoryPress = (item: CategoriesWithType) => {
    const { types, ...category } = item;
    sheetRef.current?.close();
    onSelect(category, types);
  };

  const renderItem = ({ item }: { item: CategoriesWithType }) => (
    <CategoryItem item={item} onPress={onCategoryPress} />
  );

  // BUG - IOS BUG - On first render, clicking on category will close sheet and not show the types (looks like it disappears), after that it will work normally
  // BUG - when there is textInput with autofocus prop the bottom sheet will open - FIXED with setting "softwareKeyboardLayoutMode": "pan" in app.json
  return (
    <SheetModal sheetRef={sheetRef} snapPoints={snapPoints} type={SHEETS.CATEGORY_PICKER}>
      <SheetHeader title={"Pick a category"} />
      <BottomSheetFlatList
        numColumns={CATEGORIES_NUMBER_OF_ROWS}
        data={categories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        style={styles.container}
      />
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: CONTAINER_PADDING,
    paddingHorizontal: 8,
  },
});

export default TransactionBottomSheet;
