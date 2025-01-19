import React, { FC, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import colors from "constants/colors";
import { Category, transactionCategories, Transaction } from "modules/transactionCategories";
import Separator from "components/Separator";
import CategoryTypeRowSelect from "./CategoryTypeRowSelect";
import CategoryItem, { CATEGORY_ITEM_HEIGHT } from "./CategoryItem";
import {
  CATEGORIES_NUMBER_OF_ROWS,
  HEADER_TEXT_HEIGH,
} from "app/features/balance/modules/transaction";
import CategoriesSheetHeader from "./CategoriesSheetHeader";
import createSheet from "../createSheet";
import useSheetData from "../useSheetData";
import SheetModal, { HANDLE_HEIGHT } from "../components/SheetModal";

const categoriesData = Object.values(transactionCategories).map((item) => ({
  name: item.name,
  id: item.id,
  label: item.label,
}));

const CATEGORIES_PADDING = 10;

const snapPoints = [
  CATEGORY_ITEM_HEIGHT * CATEGORIES_NUMBER_OF_ROWS +
    HANDLE_HEIGHT +
    HEADER_TEXT_HEIGH +
    CATEGORIES_PADDING * 2,
];

type Data = {
  onSelect: (category: Category, type: Transaction) => void;
};

const [emitter, openCategoriesSheet, closeCategoriesSheet] = createSheet<Data>();

export { openCategoriesSheet };

const TransactionBottomSheet: FC = () => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [data, setData] = useState<Transaction[]>(categoriesData);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const sheetData = useSheetData<Data>(emitter, sheetRef);

  const setTypeData = (id: number) => {
    const types = transactionCategories[id].types ?? [];
    setData(Object.values(types));
  };

  const clearCategory = () => {
    setData(categoriesData);
    setSelectedCategory(null);
  };

  const onRowPress = (item: Transaction | Category) => {
    if (!selectedCategory) {
      setTypeData(item.id);
      setSelectedCategory(item as Category);
    } else {
      sheetData?.onSelect(selectedCategory, item);
      closeCategoriesSheet();
    }
  };

  const onClose = () => {
    setData(categoriesData);
    setSelectedCategory(null);
  };

  const renderItems = () => {
    if (!selectedCategory) {
      return (
        <View style={styles.categories}>
          {data.map((item) => (
            <CategoryItem key={item.id} item={item} onPress={onRowPress} />
          ))}
        </View>
      );
    }
    return data.map((item) => (
      <View key={item.id}>
        <CategoryTypeRowSelect item={item} onPress={onRowPress} />
        <Separator offset={16} />
      </View>
    ));
  };

  // BUG - IOS BUG - On first render, clicking on category will close sheet and not show the types (looks like it disappears), after that it will work normally
  // BUG - when there is textInput with autofocus prop the bottom sheet will open - FIXED with setting "softwareKeyboardLayoutMode": "pan" in app.json
  return (
    <SheetModal sheetRef={sheetRef} snapPoints={snapPoints} onDismiss={onClose}>
      <CategoriesSheetHeader onBack={clearCategory} selectedCategory={selectedCategory} />
      <BottomSheetScrollView>{renderItems()}</BottomSheetScrollView>
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  header: {
    backgroundColor: colors.grey3,
    height: HEADER_TEXT_HEIGH,
    flexDirection: "row",
    paddingBottom: 10,
    justifyContent: "space-between",
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: CATEGORIES_PADDING,
  },
  icon: {
    marginLeft: 10,
    width: 30,
  },
});

export default TransactionBottomSheet;
