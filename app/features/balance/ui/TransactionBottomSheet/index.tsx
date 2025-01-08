import React, { useCallback, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import colors from "constants/colors";
import {
  Category,
  transactionCategories,
  Transaction,
} from "modules/transactionCategories";
import Separator from "components/Separator";
import TransactionRowSelect from "./TransactionRowSelect";
import TransactionItem, { TRANSACTION_ITEM_HEIGHT } from "./TransactionItem";
import {
  CATEGORIES_NUMBER_OF_ROWS,
  HEADER_TEXT_HEIGH,
} from "app/features/balance/modules/transaction";
import TransactionSheetHeader from "./TransactionSheetHeader";

const categoriesData = Object.values(transactionCategories)
  .map((item) => ({
    name: item.name,
    id: item.id,
    label: item.label,
  }));

const HANDLE_HEIGHT = 24;
const CATEGORIES_PADDING = 10;

const snapPoints = [
  TRANSACTION_ITEM_HEIGHT * CATEGORIES_NUMBER_OF_ROWS +
    HANDLE_HEIGHT +
    HEADER_TEXT_HEIGH +
    CATEGORIES_PADDING * 2,
];

type Props = {
  onSelect: (category: Category, type: Transaction) => void;
};

type refProps = {
  openSheet: () => void;
};

const TransactionBottomSheet: React.ForwardRefRenderFunction<refProps, Props> = (props, ref) => {
  const { onSelect } = props;
  const sheetRef = useRef<BottomSheet>(null);
  const [data, setData] = useState<Transaction[]>(categoriesData);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const openSheet = useCallback(() => {
    sheetRef.current?.expand();
  }, []);
  const closeSheet = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  useImperativeHandle(ref, () => ({
    openSheet: () => openSheet(),
  }));

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
      onSelect(selectedCategory, item);
      closeSheet();
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
            <TransactionItem key={item.id} item={item} onPress={onRowPress} />
          ))}
        </View>
      );
    }
    return data.map((item) => (
      <View key={item.id}>
        <TransactionRowSelect item={item} onPress={onRowPress} />
        <Separator offset={16} />
      </View>
    ));
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );
  // BUG - IOS BUG - On first render, clicking on category will close sheet and not show the types (looks like it disappears), after that it will work normally
  // BUG - when there is textInput with autofocus prop the bottom sheet will open - FIXED with setting "softwareKeyboardLayoutMode": "pan" in app.json
  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      index={-1}
      onClose={onClose}
      backdropComponent={renderBackdrop}
      handleStyle={styles.handle}
      handleHeight={HANDLE_HEIGHT}
    >
      <TransactionSheetHeader onBack={clearCategory} selectedCategory={selectedCategory} />
      <BottomSheetScrollView>{renderItems()}</BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  handle: {
    backgroundColor: colors.grey3,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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

export default React.forwardRef(TransactionBottomSheet);
