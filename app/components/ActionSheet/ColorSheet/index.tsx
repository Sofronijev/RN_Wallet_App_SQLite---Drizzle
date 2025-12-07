import React, { FC, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import SheetModal from "../components/SheetModal";
import SheetHeader from "../components/SheetHeader";
import colors from "constants/colors";
import { colorsArray } from "./sheetColors";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

type Data = {
  onSelect: (color: string) => void;
  selected?: string;
};

const PADDING = 16;
const BOX_MARGIN = 2;
const NUM_OF_COLUMNS = 8;

const ColorSheet: FC<Data> = ({ onSelect, selected }) => {
  const sheetRef = useRef<BottomSheetModalMethods | null>(null);

  const onItemPress = (item: string) => () => {
    onSelect(item);
    sheetRef.current?.close();
  };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = item === selected;

    return (
      <TouchableOpacity
        style={[styles.colorBox, { backgroundColor: item }]}
        onPress={onItemPress(item)}
      >
        {isSelected && (
          <View style={styles.checkContainer}>
            <FontAwesome name='check' size={20} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
    justifyContent: "center",
    alignItems: "center",
  },
  checkContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ColorSheet;
