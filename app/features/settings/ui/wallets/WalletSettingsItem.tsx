import { View, Text, StyleSheet } from "react-native";
import React from "react";
import colors from "constants/colors";
import { formatDecimalDigits } from "modules/numbers";
import ButtonText from "components/ButtonText";
import { showBalancePrompt, showStartingBalancePrompt } from "app/features/settings/modules";
import { WalletType } from "app/features/balance/modules/types";
import Label from "components/Label";

type Props = {
  wallet: WalletType;
};

const WalletSettingsItem: React.FC<Props> = ({ wallet }) => {
  if (!wallet) return null;

  const onStartingBalancePress = () => {
    showStartingBalancePrompt(wallet.walletId);
  };

  const onBalancePress = () => {
    showBalancePrompt(wallet.walletId, wallet.currentBalance);
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
        <Label>
          {wallet.currencyCode} {wallet.currencySymbol}
        </Label>
      </View>
      <View style={styles.row}>
        <Label>Color:</Label>
        <Label>{wallet.color}</Label>
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
  },
});
