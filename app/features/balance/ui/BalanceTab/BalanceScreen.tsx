import { StyleSheet, View } from "react-native";
import React, { useEffect, useRef } from "react";
import AddButton from "components/AddButton";
import WalletList from "app/features/balance/ui/BalanceTab/WalletList";
import { ScrollView } from "react-native-gesture-handler";
import RecentTransactions from "app/features/balance/ui/BalanceTab/RecentTransactions";
import NullScreen from "components/NullScreen";
import MonthlyBalance from "./MonthlyBalance";
import { setStartingBalanceMutation, useGetSelectedWalletQuery } from "app/queries/wallets";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import { startingBalanceStrings } from "constants/strings";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import TotalHistoryChart from "../HistoryChart/TotalHistoryChart";
import TotalWalletsBalance from "./TotalWalletsBalance";
import { useDashboardOptions } from "app/context/DashboardOptions/DashboardOptionsContext";
import { useIsFocused } from "@react-navigation/native";

const BalanceScreen: React.FC = () => {
  const { data: selectedWallet } = useGetSelectedWalletQuery();
  const { setStartingBalance } = setStartingBalanceMutation();
  const { openSheet } = useActionSheet();
  const tStyles = useThemedStyles(styles);
  const hasStartingBalance = !!selectedWallet?.startingBalance;
  const { options: dashboardOptions } = useDashboardOptions();
  const scrollViewRef = useRef<ScrollView>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [dashboardOptions, isFocused]);

  const onChangeStartingBalance = () => {
    if (!selectedWallet) return;

    openSheet({
      type: SHEETS.NUMERIC_KEYBOARD,
      props: {
        onSetAmount: (amount: number) =>
          setStartingBalance({ id: selectedWallet.walletId, amount }),
        title: startingBalanceStrings.title,
        subtitle: startingBalanceStrings.subtitle,
      },
    });
  };

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={tStyles.container}
        showsVerticalScrollIndicator={false}
      >
        {dashboardOptions.showTotalBalance && <TotalWalletsBalance />}
        <WalletList selectedWalletId={selectedWallet?.walletId} />
        {dashboardOptions.showMonthlySummary && (
          <View style={tStyles.itemContainer}>
            <MonthlyBalance />
          </View>
        )}
        {dashboardOptions.showBalanceTrend && (
          <View style={tStyles.itemContainer}>
            <TotalHistoryChart />
          </View>
        )}
        {dashboardOptions.showRecentTransactions ? (
          <View style={tStyles.itemContainer}>
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
        ) : null}
      </ScrollView>
      <AddButton />
    </>
  );
};

export default BalanceScreen;

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: 64,
      backgroundColor: theme.colors.background,
      gap: 16,
    },
    itemContainer: {
      marginHorizontal: 16,
    },
  });
