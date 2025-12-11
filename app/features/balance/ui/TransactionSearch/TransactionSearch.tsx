import { FlatList, StyleSheet, View } from "react-native";
import React from "react";
import TransactionsRow from "components/TransactionRow";
import AppActivityIndicator from "components/AppActivityIndicator";
import NullScreen from "components/NullScreen";
import { TransactionType } from "db";
import { useGetTransactionsInfiniteQuery } from "app/queries/transactions";
import { useGetSelectedWalletQuery } from "app/queries/wallets";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

const TransactionSearch = () => {
  const { data: selectedWallet } = useGetSelectedWalletQuery();
  const {
    data: transactions,
    fetchNextPage,
    hasNextPage,
  } = useGetTransactionsInfiniteQuery(selectedWallet?.walletId);
  const styles = useThemedStyles(themeStyles);

  const searchMoreTransactions = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  if (!transactions.length) {
    return (
      <NullScreen
        icon='wallet'
        isLoading={false}
        title='No transactions added'
        subtitle='Start tracking your expenses and incomes to gain better control of your finances'
      />
    );
  }

  const renderItem = ({ item }: { item: TransactionType }) => (
    <TransactionsRow key={item.id} transaction={item} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        style={styles.flatList}
        onEndReached={searchMoreTransactions}
        onEndReachedThreshold={0.2}
      />
      <AppActivityIndicator isLoading={false} />
    </View>
  );
};

export default TransactionSearch;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    flatList: {
      paddingHorizontal: 16,
    },
    text: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
  });
