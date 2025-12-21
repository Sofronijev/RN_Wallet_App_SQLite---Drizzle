import React, { FC, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import SheetModal from "../components/SheetModal";
import SheetHeader from "../components/SheetHeader";
import colors from "constants/colors";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { IconData, IconSheetIcons } from "./icons";

import CategoryIcon from "components/CategoryIcon";
import CheckMark from "components/CheckMark";

type Data = {
  onSelect: (color: IconData) => void;
  selected?: IconData;
  color?: string;
};

const PADDING = 16;
const NUM_OF_COLUMNS = 6;

const IconSheet: FC<Data> = ({ onSelect, selected, color = colors.black }) => {
  const sheetRef = useRef<BottomSheetModalMethods | null>(null);

  const onItemPress = (item: IconData) => () => {
    onSelect(item);
    sheetRef.current?.close();
  };

  const renderItem = ({ item }: { item: IconData }) => {
    const isSelected =
      item.iconName === selected?.iconName && item.iconFamily === selected?.iconFamily;

    return (
      <TouchableOpacity style={[styles.colorBox]} onPress={onItemPress(item)}>
        <CategoryIcon
          color={color}
          iconFamily={item.iconFamily}
          name={item.iconName}
          iconSize={28}
          plain
        />
        {isSelected && <CheckMark size={16} position={{ top: 24, right: 10 }} />}
      </TouchableOpacity>
    );
  };

  return (
    <SheetModal sheetRef={sheetRef}>
      <BottomSheetFlatList
        numColumns={NUM_OF_COLUMNS}
        data={IconSheetIcons}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        ListHeaderComponent={() => <SheetHeader title='Choose icon' />}
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
    flex: 1,
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

export default IconSheet;
