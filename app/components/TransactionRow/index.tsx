import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import colors from "constants/colors";
import Label from "components/Label";
import CategoryIcon from "components/CategoryIcon";
import { formatDecimalDigits } from "modules/numbers";
import { CategoryNumber, transactionCategories } from "modules/transactionCategories";
import { formatDayString, formatIsoDate } from "modules/timeAndDate";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";

type Props = {
  transaction: any;
};

const TransactionsRow: React.FC<Props> = ({ transaction }) => {
  if (!transaction) return null;
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const category = transactionCategories[transaction.categoryId];
  const type = category.types[transaction.type_id];
  const hasDescription = !!transaction.description;
  // TODO!! get type from modules
  const transactionReceivedId = 70;
  const transactionSentId = 69;
  const isIncome =
    transaction.categoryId === CategoryNumber.income ||
    transaction.type_id === transactionReceivedId;

  const openEditTransaction = () => {
    if (transaction.categoryId === CategoryNumber.transfer) {
      navigation.navigate("TransferForm", {
        walletId: transaction.wallet_id,
        editData: {
          amount: transaction.amount,
          transactionIdFrom: transaction.type_id === transactionSentId ? transaction.id : undefined,
          transactionIdTo:
            transaction.type_id === transactionReceivedId ? transaction.id : undefined,
        },
      });
    } else {
      navigation.navigate("Transaction", {
        id: transaction.id,
      });
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={openEditTransaction}>
      <View style={styles.icon}>
        <CategoryIcon categoryName={category.name} />
      </View>
      <View style={styles.descriptionContainer}>
        <Label numberOfLines={hasDescription ? 1 : 2} style={styles.label}>
          {type?.label}
        </Label>
        {hasDescription && (
          <Label numberOfLines={1} style={styles.descriptionText}>
            {transaction.description}
          </Label>
        )}
      </View>
      <View>
        <Label style={[styles.price, isIncome && styles.incomeColor]}>
          {`${formatDecimalDigits(transaction.amount)}`}
        </Label>
        <View style={styles.dateContainer}>
          <Label style={styles.date} numberOfLines={1}>
            {formatDayString(transaction.date)}
          </Label>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionsRow;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    justifyContent: "space-between",
    flex: 1,
  },
  icon: {
    paddingHorizontal: 10,
  },
  price: {
    fontSize: 18,
    paddingHorizontal: 10,
    fontWeight: "bold",
  },
  descriptionContainer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
  },
  descriptionText: {
    fontSize: 16,
    color: colors.grey4,
  },
  incomeColor: {
    color: colors.greenMint,
  },
  dateContainer: {
    flexDirection: "row-reverse",
  },
  date: {
    paddingHorizontal: 10,
    color: colors.grey4,
  },
});
