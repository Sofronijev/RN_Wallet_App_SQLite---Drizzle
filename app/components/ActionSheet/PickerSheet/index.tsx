import React, { useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import createSheet from "../createSheet";
import useSheetData from "../useSheetData";
import SheetModal from "../components/SheetModal";
import Label from "components/Label";
import SheetHeader from "../components/SheetHeader";
import colors from "constants/colors";

const snapPoints = ["50%"];

type PickerSheetItem<T extends string | number | null> = {
  label: string;
  value: T;
};

type Data<T extends string | number | null> = {
  title?: string;
  data: PickerSheetItem<T>[];
  onSelect: (item: PickerSheetItem<T>["value"]) => void;
};

const ITEM_HEIGHT = 50;

const [emitter, openSheet, closePickerSheet] = createSheet();

const openPickerSheet = <T extends string | number | null>(arg: Data<T>) => {
  openSheet(arg);
};

export { openPickerSheet };

const PickerSheet = <T extends string | number | null>() => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const sheetData = useSheetData<Data<T>>(emitter, sheetRef);

  const { data, onSelect, title = "" } = sheetData || {};

  const onItemPress = (value: PickerSheetItem<T>["value"]) => () => {
    onSelect?.(value);
    closePickerSheet();
  };

  const renderItem = useCallback(
    ({ item }: { item: PickerSheetItem<T> }) => (
      <TouchableOpacity style={styles.item} onPress={onItemPress(item.value)}>
        <Label style={styles.label}>{item.label}</Label>
      </TouchableOpacity>
    ),
    [sheetData]
  );

  return (
    <SheetModal sheetRef={sheetRef} snapPoints={snapPoints}>
      <SheetHeader title={title} />
      <BottomSheetFlatList data={data} renderItem={renderItem} style={styles.container} />
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  item: {
    height: ITEM_HEIGHT,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 20,
    marginVertical: 5,
  },
  label: {
    fontSize: 16,
    textAlignVertical: "center",
    flex: 1,
    color: colors.dark,
    paddingLeft: 16,
  },
});

export default PickerSheet;
