import React, { FC, useRef } from "react";
import { StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import SheetModal, { HANDLE_HEIGHT } from "../components/SheetModal";
import SheetHeader, { HEADER_TEXT_HEIGH } from "../components/SheetHeader";
import colors from "constants/colors";
import { colorsArray } from "./sheetColors";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { SHEETS } from "../ActionSheetManager";

type Data = {
  onSelect: (color: string) => void;
};

const PADDING = 16;
const BOX_MARGIN = 2;
const NUM_OF_COLUMNS = 10;

const ColorSheet: FC<Data> = ({ onSelect }) => {
  const sheetRef = useRef<BottomSheetModalMethods | null>(null);
  const { width } = useWindowDimensions();

  const onItemPress = (item: string) => () => {
    onSelect(item);
    sheetRef.current?.close();
  };

  const boxWidth = (width - PADDING * 2) / 10;

  const snapPoints = [
    boxWidth * (colorsArray.length / NUM_OF_COLUMNS) +
      HEADER_TEXT_HEIGH +
      HANDLE_HEIGHT +
      PADDING * 2,
  ];

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.colorBox, { backgroundColor: item, width: boxWidth - 4 }]}
      onPress={onItemPress(item)}
    />
  );

  return (
    <SheetModal sheetRef={sheetRef} snapPoints={snapPoints} type={SHEETS.COLOR_PICKER}>
      <SheetHeader title='Choose color' />
      <BottomSheetFlatList
        numColumns={NUM_OF_COLUMNS}
        data={colorsArray}
        renderItem={renderItem}
        style={styles.container}
      />
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING,
    paddingVertical: 8,
  },
  colorBox: {
    aspectRatio: 1,
    margin: BOX_MARGIN,
    borderRadius: 50,
    borderColor: colors.grey,
    borderWidth: 1,
  },
});

export default ColorSheet;
