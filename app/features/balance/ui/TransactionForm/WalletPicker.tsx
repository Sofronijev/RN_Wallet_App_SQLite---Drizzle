import { FlatList, ListRenderItem, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import Label from "components/Label";
import { WalletType } from "app/queries/wallets";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";

type Props = {
  selected: number;
  onSelect: (walletId: number) => void;
  wallets: WalletType[];
  disabled?: boolean;
};

const WalletPicker: React.FC<Props> = ({ wallets, selected, onSelect, disabled }) => {
  const styles = useThemedStyles(themeStyles);
  const colors = useColors();

  const renderItem: ListRenderItem<WalletType> = ({ item }) => {
    const isSelected = selected === item.walletId;
    const onPress = () => onSelect(item.walletId);
    const currency = item.currencySymbol || item.currencyCode;

    return (
      <TouchableOpacity
        style={[
          styles.walletContainer,
          disabled && {
            backgroundColor: colors.disabled,
          },
          isSelected && {
            backgroundColor: colors.selected,
          },
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Label>
          <Label
            style={[styles.text, disabled && { color: colors.muted }]}
          >{`${item.walletName}`}</Label>
          {currency && <Label>{` (${currency})`}</Label>}
        </Label>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={wallets}
        horizontal
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default WalletPicker;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      height: 40,
    },
    walletContainer: {
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 15,
      marginRight: 10,
      justifyContent: "center",
      backgroundColor: theme.colors.card,
    },
    text: {
      fontSize: 15,
    },
  });
