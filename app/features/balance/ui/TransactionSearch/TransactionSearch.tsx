import { FlatList, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import TransactionsRow from "components/TransactionRow";
import AppActivityIndicator from "components/AppActivityIndicator";
import colors from "constants/colors";
import NullScreen from "components/NullScreen";
import useGetSelectedWallet from "../../hooks/useGetSelectedWallet";
import useGetTransactions from "../../hooks/useGetTransactions";
import { TransactionType } from "db";

const TransactionSearch = () => {
  const { selectedWalletId } = useGetSelectedWallet();
  const [limit, setLimit] = useState(15);
  const { data: transactions, count } = useGetTransactions(selectedWalletId, limit);
  const searchMoreTransactions = () => {
    if (transactions.length < count) {
      setLimit((prevLimit) => prevLimit + 15);
    }
  };

  if (!count) {
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
