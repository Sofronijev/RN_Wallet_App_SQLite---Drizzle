import { StyleSheet, View } from "react-native";
import React from "react";
import AddButton from "components/AddButton";
import WalletList from "app/features/balance/ui/BalanceTab/WalletList";
import { ScrollView } from "react-native-gesture-handler";
import RecentTransactions from "app/features/balance/ui/BalanceTab/RecentTransactions";
import NullScreen from "components/NullScreen";
import { showStartingBalancePrompt } from "app/features/settings/modules";
import MonthlyBalance from "./MonthlyBalance";
import { setStartingBalanceMutation, useGetSelectedWalletQuery } from "app/queries/wallets";

const BalanceScreen: React.FC = () => {
  const { data: selectedWallet } = useGetSelectedWalletQuery();
  const { setStartingBalance } = setStartingBalanceMutation();
  const hasStartingBalance = !!selectedWallet?.startingBalance;

  const onChangeStartingBalance = () => {
    if (!selectedWallet) return;
    showStartingBalancePrompt((amount: number) =>
      setStartingBalance({ id: selectedWallet.walletId, amount })
    );
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <WalletList selectedWalletId={selectedWallet?.walletId} />
        <View style={styles.itemContainer}>
          <MonthlyBalance />
        </View>
        <View style={styles.itemContainer}>
          <RecentTransactions
            isLoading={false}
            title='Recent transactions'
            nullScreen={
              <NullScreen
                isLoading={false}
                title='No transactions'
                subtitle='Tap the plus sign (+) button to start tracking your expenses and incomes to gain better control of your finances.'
                icon='wallet'
                buttonText={hasStartingBalance ? undefined : "Add starting balance"}
                onPress={onChangeStartingBalance}
              />
            }
          />
        </View>
      </ScrollView>
      <AddButton />
    </>
  );
};

export default BalanceScreen;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
    paddingTop: 16,
  },
  itemContainer: {
    marginHorizontal: 16,
  },
});
