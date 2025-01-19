import React, { FC, useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import createSheet from "../createSheet";
import useSheetData from "../useSheetData";
import SheetModal from "../components/SheetModal";
import Label from "components/Label";
import { CurrencyType, currencies } from "app/currencies/currencies";
import SheetHeader from "../components/SheetHeader";

const snapPoints = ["50%"];

type Data = {
  onSelect: (currency: CurrencyType | null) => void;
};

const [emitter, openCurrencySheet, closeCurrencySheer] = createSheet<Data>();

export { openCurrencySheet };

const currencyArray = Object.values(currencies);

const CurrencySheet: FC = () => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const sheetData = useSheetData<Data>(emitter, sheetRef);

  const onItemPress = (item: CurrencyType) => () => {
    sheetData?.onSelect(item);
    closeCurrencySheer();
  };

  const onRemoveCurrency = () => {
    sheetData?.onSelect(null);
    closeCurrencySheer();
  };

  const renderItem = useCallback(
    ({ item }: { item: CurrencyType }) => (
      <TouchableOpacity onPress={onItemPress(item)}>
        <Label style={styles.text}>
          <Label style={styles.code}>{item.currencyCode} </Label>
          <Label> - {item.name}</Label>
          {item.symbolNative && <Label style={styles.symbol}> - {item.symbolNative}</Label>}
        </Label>
      </TouchableOpacity>
    ),
    [sheetData]
  );

  return (
    <SheetModal sheetRef={sheetRef} snapPoints={snapPoints}>
      <SheetHeader title='Choose currency' onBack={onRemoveCurrency} backText={"Remove"} />
      <BottomSheetFlatList data={currencyArray} renderItem={renderItem} style={styles.container} />
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    paddingVertical: 2,
  },
  code: {
    fontWeight: "bold",
  },
  symbol: {
    fontSize: 20,
  },
});

export default CurrencySheet;
