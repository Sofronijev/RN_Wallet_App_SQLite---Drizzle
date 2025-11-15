import { StyleSheet, View } from "react-native";
import React from "react";
import Label from "components/Label";
import colors from "constants/colors";
import TransactionsRow from "../../../../components/TransactionRow";
import AppActivityIndicator from "components/AppActivityIndicator";
import ButtonText from "components/ButtonText";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { useGetTransactionsQuery } from "app/queries/transactions";
import { useGetSelectedWalletQuery } from "app/queries/wallets";
import ShadowBoxView from "components/ShadowBoxView";

type RecentTransactionsProps = {
  isLoading: boolean;
  title?: string;
  nullScreen?: JSX.Element;
};

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  isLoading,
  title,
  nullScreen,
}) => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const { data: selectedWallet } = useGetSelectedWalletQuery();
  const { data } = useGetTransactionsQuery(selectedWallet?.walletId, 5);
  const { transactions } = data;

  const loading = isLoading || false;
  const hasTransactions = !!transactions?.length;

  const navigateToTransactionSearch = () => {
    navigation.navigate("TransactionSearch");
  };

  const renderTransactions = hasTransactions
    ? transactions?.map((transaction) => (
        <TransactionsRow key={transaction.id} transaction={transaction} />
      ))
    : nullScreen;

  const renderLoading = (
    <View style={styles.loadingContainer}>
      <AppActivityIndicator isLoading />
    </View>
  );
  return (
    <ShadowBoxView style={styles.container}>
      {title && <Label style={styles.title}>{title}</Label>}
      {loading ? renderLoading : renderTransactions}
      <View style={styles.button}>
        <ButtonText title='View all transactions' onPress={navigateToTransactionSearch} />
      </View>
    </ShadowBoxView>
  );
};

export default RecentTransactions;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 100,
  },
  loadingContainer: {
    paddingTop: 50,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    paddingBottom: 20,
    fontWeight: "500",
  },
  button: {
    paddingTop: 15,
  },
});
