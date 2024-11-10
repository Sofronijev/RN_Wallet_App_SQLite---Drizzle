import { StyleSheet, View } from "react-native";
import React from "react";
import AddButton from "components/AddButton";
import WalletList from "app/features/balance/ui/BalanceTab/WalletList";
import { ScrollView } from "react-native-gesture-handler";
import RecentTransactions from "app/features/balance/ui/BalanceTab/RecentTransactions";
import NullScreen from "components/NullScreen";
import { showStartingBalancePrompt } from "app/features/settings/modules";
import MonthlyBalance from "./MonthlyBalance";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getSelectedWalletInfo } from "app/services/userQueries";

const BalanceScreen: React.FC = () => {
  const { data } = useLiveQuery(getSelectedWalletInfo());
  const walletId = data?.selectedWalletId;
  const hasStartingBalance = !!data?.selectedWallet?.startingBalance;

  const onChangeStartingBalance = () => {
    if (!walletId) return;
    showStartingBalancePrompt((text: string) => console.log(text));
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <WalletList />
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
  },
  itemContainer: {
    marginHorizontal: 16,
  },
});
