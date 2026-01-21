import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { formatDecimalDigits, roundDecimals } from "modules/numbers";
import ButtonText from "components/ButtonText";
import Label from "components/Label";
import {
  changeCurrentBalanceMutation,
  deleteWalletMutation,
  setColorMutation,
  setCurrencyMutation,
  setStartingBalanceMutation,
  setWalletNameMutation,
  WalletType,
} from "app/queries/wallets";
import { CurrencyType } from "app/currencies/currencies";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import AlertPrompt from "components/AlertPrompt";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import { changeBalanceStrings, startingBalanceStrings } from "constants/strings";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { addColorOpacity } from "modules/colorHelper";
import ShadowBoxView from "components/ShadowBoxView";

type Props = {
  wallet: WalletType;
  canDeleteWallet: boolean;
};

const WalletSettingsItem: React.FC<Props> = ({ wallet, canDeleteWallet }) => {
  const { setStartingBalance } = setStartingBalanceMutation();
  const { changeCurrentBalance } = changeCurrentBalanceMutation();
  const { setCurrency } = setCurrencyMutation();
  const { setColor } = setColorMutation();
  const { changeWalletName } = setWalletNameMutation();
  const { deleteWallet } = deleteWalletMutation();
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const { openSheet } = useActionSheet();
  const styles = useThemedStyles(themeStyles);
  const { text, disabled, muted } = useColors();

  if (!wallet) return null;

  const {
    walletId,
    currentBalance,
    currencyCode,
    currencySymbol,
    startingBalance,
    color,
    walletName,
  } = wallet;

  const currency = currencyCode || currencySymbol ? `${currencyCode} ${currencySymbol}` : "None";

  const onStartingBalancePress = () => {
    openSheet({
      type: SHEETS.NUMERIC_KEYBOARD,
      props: {
        onSetAmount: (amount: number) => setStartingBalance({ id: walletId, amount }),
        title: startingBalanceStrings.title,
        subtitle: startingBalanceStrings.subtitle,
        showOperators: true,
        initialValue: roundDecimals(startingBalance),
      },
    });
  };

  const onBalancePress = () => {
    openSheet({
      type: SHEETS.NUMERIC_KEYBOARD,
      props: {
        onSetAmount: (newAmount: number) => {
          if (Number(newAmount).toFixed(2) === Number(currentBalance).toFixed(2)) return;
          changeCurrentBalance({ id: walletId, currentAmount: currentBalance, newAmount });
        },
        title: changeBalanceStrings.title,
        subtitle: changeBalanceStrings.subtitle,
        showOperators: true,
        initialValue: roundDecimals(currentBalance),
      },
    });
  };

  const onCurrencyPress = () => {
    openSheet({
      type: SHEETS.CURRENCY_PICKER,
      props: {
        onSelect: (data: CurrencyType | null) => {
          setCurrency({
            id: walletId,
            currencyCode: data?.currencyCode ?? "",
            currencySymbol: data?.symbolNative ?? "",
          });
        },
        selectedCurrencyCode: currencyCode,
      },
    });
  };

  const onColorPress = () => {
    openSheet({
      type: SHEETS.COLOR_PICKER,
      props: {
        onSelect: (color: string) => {
          setColor({ id: walletId, color });
        },
        selected: color,
      },
    });
  };

  const onEditName = () => {
    AlertPrompt.prompt(
      "Rename your wallet",
      null,
      (walletName) => {
        changeWalletName({ id: walletId, walletName });
      },
      { defaultValue: walletName },
    );
  };

  const onDeleteWallet = () => {
    Alert.alert(
      "Are you sure you want to delete this wallet?",
      "All transactions and data related to it will be permanently deleted.",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteWallet({ id: walletId }),
        },
      ],
    );
  };

  return (
    <ShadowBoxView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.walletNameContainer}>
          <View style={[styles.colorIndicator, { backgroundColor: color }]} />
          <Label style={styles.name}>{walletName}</Label>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={onEditName} activeOpacity={0.7}>
            <Feather name='edit-2' size={20} color={text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDeleteWallet}
            disabled={!canDeleteWallet}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name='delete-outline'
              size={22}
              color={canDeleteWallet ? text : disabled}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View>
        <TouchableOpacity style={styles.settingRow} onPress={onBalancePress} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Feather name='dollar-sign' size={18} color={muted} />
            </View>
            <Label style={styles.settingLabel}>Balance</Label>
          </View>
          <View style={styles.settingRight}>
            <Label style={styles.settingValue}>
              {formatDecimalDigits(currentBalance, delimiter, decimal)}
            </Label>
            <Feather name='chevron-right' size={18} color={muted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={onStartingBalancePress}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Feather name='trending-up' size={18} color={muted} />
            </View>
            <Label style={styles.settingLabel}>Starting Balance</Label>
          </View>
          <View style={styles.settingRight}>
            <Label style={styles.settingValue}>
              {formatDecimalDigits(startingBalance, delimiter, decimal)}
            </Label>
            <Feather name='chevron-right' size={18} color={muted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={onCurrencyPress} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Feather name='globe' size={18} color={muted} />
            </View>
            <Label style={styles.settingLabel}>Currency</Label>
          </View>
          <View style={styles.settingRight}>
            <Label style={styles.settingValue}>{currency}</Label>
            <Feather name='chevron-right' size={18} color={muted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={onColorPress} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Feather name='droplet' size={18} color={muted} />
            </View>
            <Label style={styles.settingLabel}>Color</Label>
          </View>
          <View style={styles.settingRight}>
            <View style={[styles.colorBox, { backgroundColor: color }]} />
            <Feather name='chevron-right' size={18} color={muted} />
          </View>
        </TouchableOpacity>
      </View>
    </ShadowBoxView>
  );
};

export default WalletSettingsItem;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginBottom: 8,
      backgroundColor: theme.colors.card,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    walletNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    colorIndicator: {
      width: 4,
      height: 24,
      borderRadius: 2,
      marginRight: 12,
    },
    name: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    actionsContainer: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: addColorOpacity(theme.colors.border, 0.5),
      alignItems: "center",
      justifyContent: "center",
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      opacity: 0.3,
      marginHorizontal: 16,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    settingLabel: {
      fontSize: 15,
      color: theme.colors.text,
      fontWeight: "500",
    },
    settingRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    settingValue: {
      fontSize: 15,
      color: theme.colors.muted,
      fontWeight: "500",
    },
    colorBox: {
      height: 28,
      width: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: theme.colors.background,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
  });
