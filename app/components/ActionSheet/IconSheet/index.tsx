import React, { FC, useRef } from "react";
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons/static";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import SheetModal from "../components/SheetModal";
import SheetHeader from "../components/SheetHeader";
import colors from "constants/colors";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { IconData, IconSheetIcons } from "./icons";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

import CategoryIcon from "components/CategoryIcon";

type Data = {
  onSelect: (color: IconData) => void;
  selected?: IconData;
  color?: string;
};

const PADDING = 16;
const NUM_OF_COLUMNS = 6;

const IconSheet: FC<Data> = ({ onSelect, selected, color = colors.black }) => {
  const sheetRef = useRef<BottomSheetModalMethods | null>(null);
  const styles = useThemedStyles(themedStyles);
  const { height } = useWindowDimensions();

  const onItemPress = (item: IconData) => () => {
    onSelect(item);
    sheetRef.current?.close();
  };

  const renderItem = ({ item }: { item: IconData }) => {
    const isSelected =
      item.iconName === selected?.iconName && item.iconFamily === selected?.iconFamily;

    return (
      <View style={styles.cell}>
        <TouchableOpacity
          style={[
            styles.tile,
            isSelected && { backgroundColor: color + "20", borderColor: color },
          ]}
          onPress={onItemPress(item)}
          activeOpacity={0.7}
        >
          <CategoryIcon
            color={color}
            iconFamily={item.iconFamily}
            name={item.iconName}
            iconSize={28}
            plain
          />
          {isSelected && (
            <View style={styles.checkBadge}>
              <Ionicons name='checkmark-circle' size={18} color={color} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SheetModal sheetRef={sheetRef} maxDynamicContentSize={height * 0.33}>
      <BottomSheetFlatList
        numColumns={NUM_OF_COLUMNS}
        data={IconSheetIcons}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.iconFamily}-${item.iconName}`}
        contentContainerStyle={styles.container}
        ListHeaderComponent={() => <SheetHeader title='Choose icon' />}
        stickyHeaderIndices={[0]}
      />
    </SheetModal>
  );
};

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: PADDING,
      paddingBottom: 16,
    },
    cell: {
      flex: 1 / NUM_OF_COLUMNS,
      padding: 4,
    },
    tile: {
      aspectRatio: 1,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardInner,
      justifyContent: "center",
      alignItems: "center",
    },
    checkBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: theme.colors.card,
      borderRadius: 9,
    },
  });

export default IconSheet;
