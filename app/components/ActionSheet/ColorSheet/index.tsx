import React, { FC, useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import createSheet from "../createSheet";
import useSheetData from "../useSheetData";
import SheetModal, { HANDLE_HEIGHT } from "../components/SheetModal";
import SheetHeader, { HEADER_TEXT_HEIGH } from "../components/SheetHeader";
import colors from "constants/colors";
import { colorsArray } from "./sheetColors";

type Data = {
  onSelect: (color: string) => void;
};

const [emitter, openColorSheet, closeColorSheet] = createSheet<Data>();

export { openColorSheet };

const PADDING = 16;
const BOX_MARGIN = 2;
const NUM_OF_COLUMNS = 10;

const ColorSheet: FC = () => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const sheetData = useSheetData<Data>(emitter, sheetRef);
  const { width } = useWindowDimensions();

  const onItemPress = (item: string) => () => {
    sheetData?.onSelect(item);
    closeColorSheet();
  };

  const boxWidth = (width - PADDING * 2) / 10;
  const snapPoints = [
    boxWidth * (colorsArray.length / NUM_OF_COLUMNS) +
      HEADER_TEXT_HEIGH +
      HANDLE_HEIGHT +
      PADDING * 2,
  ];

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        style={[styles.colorBox, { backgroundColor: item, width: boxWidth - 4 }]}
        onPress={onItemPress(item)}
      ></TouchableOpacity>
    ),
    [sheetData]
  );

  return (
    <SheetModal sheetRef={sheetRef} snapPoints={snapPoints}>
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
