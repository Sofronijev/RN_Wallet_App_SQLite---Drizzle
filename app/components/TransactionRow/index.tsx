import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import colors from "constants/colors";
import Label from "components/Label";
import { formatDecimalDigits } from "modules/numbers";
import { CategoryNumber, typeIds } from "modules/categories";
import { formatDayString } from "modules/timeAndDate";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { useGetCategories } from "app/queries/categories";
import CategoryIcon from "components/CategoryIcon";
import { TransactionType } from "db";

type Props = {
  transaction: TransactionType;
};

const TransactionsRow: React.FC<Props> = ({ transaction }) => {
  if (!transaction) return null;
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const hasDescription = !!transaction.description;
  const transactionId = transaction.id;
  const transferId = transaction.transfer_id;
  const transactionReceivedId = typeIds.transfer_received;
  const { categoriesById } = useGetCategories();
  const category = categoriesById[transaction.categoryId];
  const type = category.types.find((type) => type.id === transaction.type_id);

  const isIncome =
    transaction.categoryId === CategoryNumber.income ||
    transaction.type_id === transactionReceivedId;

  const openEditTransaction = () => {
    if (transferId) {
      navigation.navigate("TransferForm", {
        walletId: transaction.wallet_id,
        editTransferId: transferId,
      });
    } else {
      navigation.navigate("Transaction", {
        id: transactionId,
      });
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={openEditTransaction}>
      <View style={styles.icon}>
        <CategoryIcon
          color={category.iconColor}
          iconFamily={category.iconFamily}
          name={category.iconName}
        />
      </View>
      <View style={styles.descriptionContainer}>
        <Label numberOfLines={hasDescription ? 1 : 2} style={styles.label}>
          {`${category.name} `}
          {transaction.type_id && <Label style={styles.typeText}>{`(${type?.name})`}</Label>}
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
    fontStyle: "italic",
  },
  typeText: {
    fontWeight: "normal",
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
