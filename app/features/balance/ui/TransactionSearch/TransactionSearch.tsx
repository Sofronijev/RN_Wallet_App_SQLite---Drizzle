import { FlatList, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import TransactionsRow from "components/TransactionRow";
import AppActivityIndicator from "components/AppActivityIndicator";
import colors from "constants/colors";
import NullScreen from "components/NullScreen";

const TransactionSearch = () => {
  const userId = 1;
  const activeWallet = {};
  const walletId = activeWallet?.walletId;

  const transactions = [];
  const count = 1;
  const transactionNumber = 1;
  const searchMoreTransactions = () => {
  };

  if (!transactionNumber) {
    return (
      <NullScreen
        icon='wallet'
        isLoading={false}
        title='No transactions added'
        subtitle='Start tracking your expenses and incomes to gain better control of your finances'
      />
    );
  }

  const renderItem = ({ item }: { item: unknown }) => (
    <TransactionsRow key={item.id} transaction={item} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        style={styles.flatList}
        onEndReached={searchMoreTransactions}
        onEndReachedThreshold={0.1}
      />
      <AppActivityIndicator isLoading={false} />
    </View>
  );
};

export default TransactionSearch;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  flatList: {
    paddingHorizontal: 16,
  },
  text: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
});
