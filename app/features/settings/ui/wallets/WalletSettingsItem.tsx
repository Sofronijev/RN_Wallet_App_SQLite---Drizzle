import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React from "react";
import colors from "constants/colors";
import { formatDecimalDigits } from "modules/numbers";
import ButtonText from "components/ButtonText";
import { showBalancePrompt, showStartingBalancePrompt } from "app/features/settings/modules";
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
    showStartingBalancePrompt((amount: number) => setStartingBalance({ id: walletId, amount }));
  };

  const onBalancePress = () => {
    showBalancePrompt((newAmount: number) =>
      changeCurrentBalance({ id: walletId, currentAmount: currentBalance, newAmount })
    );
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
      },
    });
  };

  const onEditName = () => {
    AlertPrompt.prompt(
      "Give your wallet a new name",
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
        <Label style={styles.name}>{walletName}</Label>
        <View style={styles.iconsContainer}>
          <TouchableOpacity onPress={onEditName}>
            <MaterialIcons name='edit' size={24} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDeleteWallet} disabled={!canDeleteWallet}>
            <MaterialIcons
              name='delete'
              size={24}
              color={canDeleteWallet ? colors.black : colors.disabled}
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

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    borderColor: colors.grey,
    backgroundColor: colors.white,
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
