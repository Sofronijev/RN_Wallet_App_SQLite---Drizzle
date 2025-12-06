import React, { FC, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import SheetModal from "../components/SheetModal";
import SheetHeader from "../components/SheetHeader";
import colors from "constants/colors";
import { colorsArray } from "./sheetColors";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

type Data = {
  onSelect: (color: string) => void;
};

const PADDING = 16;
const BOX_MARGIN = 2;
const NUM_OF_COLUMNS = 10;

const ColorSheet: FC<Data> = ({ onSelect }) => {
  const sheetRef = useRef<BottomSheetModalMethods | null>(null);

  const onItemPress = (item: string) => () => {
    onSelect(item);
    sheetRef.current?.close();
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.colorBox, { backgroundColor: item }]}
      onPress={onItemPress(item)}
    />
  );

  return (
    <SheetModal sheetRef={sheetRef}>
      <BottomSheetFlatList
        numColumns={NUM_OF_COLUMNS}
        data={colorsArray}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        ListHeaderComponent={() => <SheetHeader title='Pick a color' />}
        stickyHeaderIndices={[0]}
      />
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING,
    paddingBottom: 16,
  },
  colorBox: {
    aspectRatio: 1,
    flex: 1,
    margin: BOX_MARGIN,
    borderRadius: 50,
    borderColor: colors.grey,
    borderWidth: 1,
  },
});

export default ColorSheet;
