import React, { useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import SheetModal from "../components/SheetModal";
import Label from "components/Label";
import SheetHeader from "../components/SheetHeader";
import colors from "constants/colors";

type PickerSheetItem<T extends number | null> = {
  label: string;
  value: T;
};

export type PickerSheetProps<T extends number | null> = {
  title?: string;
  data: PickerSheetItem<T>[];
  onSelect: (item: PickerSheetItem<T>["value"]) => void;
};

const ITEM_HEIGHT = 50;

const PickerSheet = <T extends number | null>({
  title = "",
  data,
  onSelect,
}: PickerSheetProps<T>) => {
  const sheetRef = useRef<BottomSheetModal>(null);

  const onItemPress = (value: T) => () => {
    onSelect?.(value);
    sheetRef.current?.close();
  };

  const renderItem = useCallback(
    ({ item }: { item: PickerSheetItem<T> }) => (
      <TouchableOpacity style={styles.item} onPress={onItemPress(item.value)}>
        <Label style={styles.label}>{item.label}</Label>
      </TouchableOpacity>
    ),
    []
  );

  return (
    <SheetModal sheetRef={sheetRef}>
      <BottomSheetFlatList
        data={data}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        ListHeaderComponent={() => <SheetHeader title={title} />}
        stickyHeaderIndices={[0]}
      />
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  item: {
    height: ITEM_HEIGHT,
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
