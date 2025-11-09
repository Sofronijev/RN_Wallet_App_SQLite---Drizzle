import React, { FC, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import CategoryTypeRowSelect from "./CategoryTypeRowSelect";
import CategoryItem from "./CategoryItem";
import {
  CATEGORIES_NUMBER_OF_ROWS,
  CATEGORY_ITEM_HEIGHT,
} from "app/features/balance/modules/transaction";
import CategoriesSheetHeader from "./CategoriesSheetHeader";
import createSheet from "../createSheet";
import useSheetData from "../useSheetData";
import SheetModal, { HANDLE_HEIGHT } from "../components/SheetModal";
import { HEADER_TEXT_HEIGH } from "../components/SheetHeader";
import { useGetCategories } from "app/queries/categories";
import { CategoriesWithType, Category, Type } from "db";

const CONTAINER_PADDING = 8;

type Data = {
  onSelect: (category: Category, type: Type) => void;
};

const [emitter, openCategoriesSheet, closeCategoriesSheet] = createSheet<Data>();

export { openCategoriesSheet };

const keyExtractor = <T extends { id: number }>(item: T) => item.id.toString();

const TransactionBottomSheet: FC = () => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoriesWithType | null>(null);

  const sheetData = useSheetData<Data>(emitter, sheetRef);
  const { data: categories } = useGetCategories();

  const snapPoints = [
    CATEGORY_ITEM_HEIGHT * Math.ceil(categories.length / CATEGORIES_NUMBER_OF_ROWS) +
      HANDLE_HEIGHT +
      HEADER_TEXT_HEIGH +
      CONTAINER_PADDING +
      16,
  ];
  const clearCategory = () => {
    setSelectedCategory(null);
  };

  const onCategoryPress = (item: CategoriesWithType) => {
    setSelectedCategory(item);
  };
  const onTypePress = (item: Type) => {
    if (selectedCategory) {
      const { types, ...category } = selectedCategory;
      sheetData?.onSelect(category, item);
    }
    closeCategoriesSheet();
  };
  const renderItem = ({ item }: { item: CategoriesWithType }) => (
    <CategoryItem item={item} onPress={onCategoryPress} />
  );

  const renderTypeItem = ({ item }: { item: Type }) => (
    <CategoryTypeRowSelect item={item} onPress={onTypePress} />
  );
  // BUG - IOS BUG - On first render, clicking on category will close sheet and not show the types (looks like it disappears), after that it will work normally
  // BUG - when there is textInput with autofocus prop the bottom sheet will open - FIXED with setting "softwareKeyboardLayoutMode": "pan" in app.json
  return (
    <SheetModal sheetRef={sheetRef} snapPoints={snapPoints} onDismiss={clearCategory}>
      <CategoriesSheetHeader onBack={clearCategory} selectedCategory={selectedCategory} />
      {!selectedCategory ? (
        <BottomSheetFlatList
          numColumns={CATEGORIES_NUMBER_OF_ROWS}
          key='categories-flatlist'
          data={categories}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          style={styles.container}
        />
      ) : (
        <BottomSheetFlatList
          key={`${selectedCategory.id}-types`}
          data={selectedCategory.types}
          keyExtractor={keyExtractor}
          renderItem={renderTypeItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          style={styles.container}
        />
      )}
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
