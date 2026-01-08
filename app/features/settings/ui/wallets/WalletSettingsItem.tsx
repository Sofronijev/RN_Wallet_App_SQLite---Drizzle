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
import AlertPrompt from "components/AlertPrompt";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import { changeBalanceStrings, startingBalanceStrings } from "constants/strings";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";

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
  const { text, disabled } = useColors();

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
      { defaultValue: walletName }
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
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <ButtonText title={walletName} buttonStyle={styles.name} onPress={onEditName} />
        <View style={styles.iconsContainer}>
          <TouchableOpacity onPress={onDeleteWallet} disabled={!canDeleteWallet}>
            <MaterialIcons
              name='delete-outline'
              size={24}
              color={canDeleteWallet ? text : disabled}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.row}>
        <Label>Balance:</Label>
        <ButtonText
          title={formatDecimalDigits(currentBalance, delimiter, decimal)}
          type='link'
          onPress={onBalancePress}
        />
      </View>
      <View style={styles.row}>
        <Label>Starting balance:</Label>
        <ButtonText
          title={formatDecimalDigits(startingBalance, delimiter, decimal)}
          type='link'
          onPress={onStartingBalancePress}
        />
      </View>
      <View style={styles.row}>
        <Label>Currency:</Label>
        <ButtonText title={currency} type='link' onPress={onCurrencyPress} />
      </View>
      <View style={styles.row}>
        <Label>Color:</Label>
        <TouchableOpacity
          style={[styles.colorBox, { backgroundColor: color }]}
          onPress={onColorPress}
        ></TouchableOpacity>
      </View>
    </View>
  );
};

export default WalletSettingsItem;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      marginHorizontal: 16,
      padding: 10,
      borderRadius: 10,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    titleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    iconsContainer: { flexDirection: "row" },
    name: {
      fontSize: 20,
      fontWeight: "bold",
      paddingBottom: 10,
    },
    row: {
      flexDirection: "row",
      paddingBottom: 5,
      justifyContent: "space-between",
      alignItems: "center",
    },
    colorBox: {
      height: 25,
      width: 25,
      borderRadius: 15,
    },
  });
