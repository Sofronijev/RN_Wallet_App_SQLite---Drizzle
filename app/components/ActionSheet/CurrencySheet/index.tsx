import React, { FC, useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import SheetModal from "../components/SheetModal";
import Label from "components/Label";
import { CurrencyType, currencies } from "app/currencies/currencies";
import SheetHeader from "../components/SheetHeader";
import { SHEETS } from "../ActionSheetManager";

const snapPoints = ["50%"];

type Props = {
  onSelect: (currency: CurrencyType | null) => void;
};

const currencyArray = Object.values(currencies);

const CurrencySheet: FC<Props> = ({ onSelect }) => {
  const sheetRef = useRef<BottomSheetModal>(null);

  const onItemPress = (item: CurrencyType) => () => {
    onSelect(item);
    sheetRef.current?.close();
  };

  const onRemoveCurrency = () => {
    onSelect(null);
    sheetRef.current?.close();
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
    []
  );

  return (
    <SheetModal sheetRef={sheetRef} snapPoints={snapPoints} type={SHEETS.COLOR_PICKER}>
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
