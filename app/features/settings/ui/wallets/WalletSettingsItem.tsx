import { View, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import colors from "constants/colors";
import { formatDecimalDigits } from "modules/numbers";
import ButtonText from "components/ButtonText";
import { showBalancePrompt, showStartingBalancePrompt } from "app/features/settings/modules";
import Label from "components/Label";
import {
  changeCurrentBalanceMutation,
  setColorMutation,
  setCurrencyMutation,
  setStartingBalanceMutation,
  WalletType,
} from "app/queries/wallets";
import { openCurrencySheet } from "components/ActionSheet/CurrencySheet";
import { CurrencyType } from "app/currencies/currencies";
import { openColorSheet } from "components/ActionSheet/ColorSheet";
import { setColorCurrency } from "app/services/walletQueries";

type Props = {
  wallet: WalletType;
};

const WalletSettingsItem: React.FC<Props> = ({ wallet }) => {
  const { setStartingBalance } = setStartingBalanceMutation();
  const { changeCurrentBalance } = changeCurrentBalanceMutation();
  const { setCurrency } = setCurrencyMutation();
  const { setColor } = setColorMutation();

  if (!wallet) return null;

  const currency =
    wallet.currencyCode || wallet.currencySymbol
      ? `${wallet.currencyCode} ${wallet.currencySymbol}`
      : "None";

  const { walletId, currentBalance } = wallet;
  const onStartingBalancePress = () => {
    showStartingBalancePrompt((amount: number) => setStartingBalance({ id: walletId, amount }));
  };

  const onBalancePress = () => {
    showBalancePrompt((newAmount: number) =>
      changeCurrentBalance({ id: walletId, currentAmount: currentBalance, newAmount })
    );
  };

  const onCurrencyPress = () => {
    openCurrencySheet({
      onSelect: (data: CurrencyType | null) => {
        setCurrency({
          id: wallet.walletId,
          currencyCode: data?.currencyCode ?? "",
          currencySymbol: data?.symbolNative ?? "",
        });
      },
    });
  };

  const onColorPress = () => {
    openColorSheet({
      onSelect: (color: string) => {
        setColor({ id: wallet.walletId, color });
      },
    });
  };

  return (
    <View style={styles.container}>
      <Label style={styles.name}>{wallet.walletName}</Label>
      <View style={styles.row}>
        <Label>Balance:</Label>
        <ButtonText
          title={formatDecimalDigits(wallet.currentBalance)}
          type='link'
          onPress={onBalancePress}
        />
      </View>
      <View style={styles.row}>
        <Label>Starting balance:</Label>
        <ButtonText
          title={formatDecimalDigits(wallet.startingBalance)}
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
          style={[styles.colorBox, { backgroundColor: wallet.color }]}
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
