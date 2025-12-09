import React, { useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import SheetModal from "../components/SheetModal";
import Label from "components/Label";
import SheetHeader from "../components/SheetHeader";
import colors from "constants/colors";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

type PickerSheetItem<T extends number | null> = {
  label: string;
  value: T;
};

export type PickerSheetProps<T extends number | null> = {
  title?: string;
  data: PickerSheetItem<T>[];
  onSelect: (item: PickerSheetItem<T>["value"]) => void;
};

const PickerSheet = <T extends number | null>({
  title = "",
  data,
  onSelect,
}: PickerSheetProps<T>) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const styles = useThemedStyles(themeStyles);

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

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    item: {
      paddingVertical: 8,
    },
    label: {
      fontSize: 16,
      textAlignVertical: "center",
      flex: 1,
      paddingLeft: 16,
      backgroundColor: theme.colors.cardInner,
      paddingVertical: 8,
      borderRadius: 8,
    },
  });

export default PickerSheet;
