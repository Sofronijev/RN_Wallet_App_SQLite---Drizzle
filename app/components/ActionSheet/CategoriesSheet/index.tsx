import React, { FC, useRef } from "react";
import { StyleSheet } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import CategoryItem from "./CategoryItem";
import { CATEGORIES_NUMBER_OF_ROWS } from "app/features/balance/modules/transaction";
import SheetModal from "../components/SheetModal";
import SheetHeader from "../components/SheetHeader";
import { useGetCategories } from "app/queries/categories";
import { CategoriesWithType, Category, Type } from "db";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

type Data = {
  onSelect: (category: Category, types: Type[]) => void;
};

const keyExtractor = <T extends { id: number }>(item: T) => item.id.toString();

const TransactionBottomSheet: FC<Data> = ({ onSelect }) => {
  const sheetRef = useRef<BottomSheetModalMethods | null>(null);
  const { data: categories } = useGetCategories();

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
    <SheetModal sheetRef={sheetRef}>
      <BottomSheetFlatList
        numColumns={CATEGORIES_NUMBER_OF_ROWS}
        data={categories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        contentContainerStyle={styles.container}
        ListHeaderComponent={() => <SheetHeader title='Pick a category' />}
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
  },
});

export default TransactionBottomSheet;
