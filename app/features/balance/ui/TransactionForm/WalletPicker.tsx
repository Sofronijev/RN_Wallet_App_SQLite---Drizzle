import { FlatList, ListRenderItem, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import Label from "components/Label";
import { WalletType } from "app/queries/wallets";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { formatDecimalDigits } from "modules/numbers";

type Props = {
  selected: number;
  onSelect: (walletId: number) => void;
  wallets: WalletType[];
  disabled?: boolean;
};

const WalletPicker: React.FC<Props> = ({ wallets, selected, onSelect, disabled }) => {
  const styles = useThemedStyles(themeStyles);
  const { decimal, delimiter } = useGetNumberSeparatorQuery();

  const renderItem: ListRenderItem<WalletType> = ({ item }) => {
    const isSelected = selected === item.walletId;
    const onPress = () => onSelect(item.walletId);
    const currency = item.currencySymbol || item.currencyCode;

    return (
      <TouchableOpacity
        style={[styles.walletContainer, disabled && styles.disabled, isSelected && styles.selected]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View>
          <Label style={[styles.walletName, disabled && styles.disabledText]}>
            {item.walletName}
          </Label>
          <View style={styles.contentWrapper}>
            <Label style={[styles.amount, disabled && styles.disabledText]}>
              {formatDecimalDigits(item.currentBalance, delimiter, decimal)}
            </Label>
            {currency && (
              <Label style={[styles.amount, disabled && styles.disabledText]}>{currency}</Label>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={wallets}
      horizontal
      renderItem={renderItem}
      keyExtractor={(item) => `wallet-${item.walletId}`}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

export default WalletPicker;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    listContent: {
      paddingVertical: 2,
    },
    separator: {
      width: 10,
    },
    walletContainer: {
      borderColor: theme.colors.border,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      justifyContent: "center",
      backgroundColor: theme.colors.card,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    contentWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    walletName: {
      fontSize: 15,
      fontWeight: "500",
    },
    amount: {
      fontSize: 13,
      color: theme.colors.muted,
      fontWeight: "400",
    },
    selected: {
      backgroundColor: theme.colors.selected,
      borderColor: theme.colors.primary,
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    disabled: {
      backgroundColor: theme.colors.disabled,
    },
    disabledText: {
      color: theme.colors.muted,
    },
  });
