import React, { FC, useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import SheetModal from "../components/SheetModal";
import Label from "components/Label";
import { CurrencyType, currencies } from "app/currencies/currencies";
import SheetHeader from "../components/SheetHeader";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

type Props = {
  onSelect: (currency: CurrencyType | null) => void;
};

const currencyArray = Object.values(currencies);

const keyExtractor = (item: CurrencyType) => item.currencyCode;

const CurrencySheet: FC<Props> = ({ onSelect }) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const styles = useThemedStyles(themedStyles);

  const onItemPress = (item: CurrencyType) => () => {
    onSelect(item);
    sheetRef.current?.close();
  };

  const onRemoveCurrency = () => {
    onSelect(null);
    sheetRef.current?.close();
  };

  const renderItem = useCallback(
    ({ item }: { item: CurrencyType }) => (
      <TouchableOpacity
        onPress={onItemPress(item)}
        style={styles.itemContainer}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <View style={styles.leftContent}>
            <View style={styles.symbolContainer}>
              <Label style={styles.symbol}>{item.symbolNative}</Label>
            </View>
            <View style={styles.textContent}>
              <Label style={styles.code}>{item.currencyCode}</Label>
              <Label style={styles.name}>{item.name}</Label>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [styles],
  );

  return (
    <SheetModal sheetRef={sheetRef}>
      <BottomSheetFlatList
        data={currencyArray}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        ListHeaderComponent={() => (
          <SheetHeader title='Select a currency' onBack={onRemoveCurrency} backText={"Remove"} />
        )}
        stickyHeaderIndices={[0]}
        keyExtractor={keyExtractor}
      />
    </SheetModal>
  );
};

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    itemContainer: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginVertical: 2,
      borderRadius: 8,
      backgroundColor: theme.colors.cardInner,
    },
    itemContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    leftContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    symbolContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary + "20", // 20% opacity
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    symbol: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    textContent: {
      flex: 1,
    },
    code: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 2,
    },
    name: {
      fontSize: 14,
      color: theme.colors.muted,
    },
  });

export default CurrencySheet;
