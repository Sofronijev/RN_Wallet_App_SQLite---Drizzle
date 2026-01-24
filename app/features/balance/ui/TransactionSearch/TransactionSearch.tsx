import { FlatList, StyleSheet, View } from "react-native";
import React from "react";
import TransactionsRow from "components/TransactionRow";
import AppActivityIndicator from "components/AppActivityIndicator";
import NullScreen from "components/NullScreen";
import { TransactionType } from "db";
import { useGetTransactionsInfiniteQuery } from "app/queries/transactions";
import { useGetSelectedWalletQuery } from "app/queries/wallets";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { useTransactionFilters } from "./context/TransactionFiltersContext";
import { transactionStrings } from "constants/strings";
import { objectKeys } from "modules/utils";

const TransactionSearch = () => {
  const { filters, filtersCounter } = useTransactionFilters();
  const { data: selectedWallet } = useGetSelectedWalletQuery();
  const {
    data: transactions,
    fetchNextPage,
    hasNextPage,
  } = useGetTransactionsInfiniteQuery({
    walletId: selectedWallet?.walletId,
    categoryIds: objectKeys(filters.categories).map(Number),
    typeIds: objectKeys(filters.types).flatMap((categoryId) =>
      objectKeys(filters.types[categoryId]).map(Number)
    ),
  });
  const styles = useThemedStyles(themeStyles);

  const searchMoreTransactions = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  if (!transactions.length && !!filtersCounter) {
    return (
      <NullScreen
        icon='search'
        isLoading={false}
        title={transactionStrings.noTransactions.title}
        subtitle={transactionStrings.noTransactions.subtitle}
      />
    );
  }

  if (!transactions.length) {
    return (
      <NullScreen
        icon='wallet'
        isLoading={false}
        title={transactionStrings.noTransactionSearch.title}
        subtitle={transactionStrings.noTransactionSearch.subtitle}
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
    container: { flex: 1, backgroundColor: theme.colors.card },
    flatList: {
      paddingHorizontal: 16,
    },
    text: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
  });
