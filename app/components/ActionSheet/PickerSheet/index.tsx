import React, { useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import SheetModal from "../components/SheetModal";
import Label from "components/Label";
import SheetHeader from "../components/SheetHeader";
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
      <TouchableOpacity style={styles.item} onPress={onItemPress(item.value)} activeOpacity={0.7}>
        <Label style={styles.label}>{item.label}</Label>
      </TouchableOpacity>
    ),
    [data.length]
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.cardInner,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
    },

    label: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
      flex: 1,
    },
  });

export default PickerSheet;
