import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import colors from "constants/colors";
import Label from "components/Label";
import { formatDecimalDigits } from "modules/numbers";
import { formatDayString } from "modules/timeAndDate";
import { useAppNavigation } from "navigation/routes";
import { useGetCategories } from "app/queries/categories";
import CategoryIcon from "components/CategoryIcon";
import { TransactionType } from "db";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { isIncomeTransaction } from "app/features/balance/modules/transaction";
import { CategoryNumber } from "modules/categories";

type Props = {
  transaction: TransactionType;
};

const TransactionsRow: React.FC<Props> = ({ transaction }) => {
  const navigation = useAppNavigation();
  const { categoriesById } = useGetCategories();
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const styles = useThemedStyles(themedStyles);

  if (!transaction) return null;

  const hasDescription = !!transaction.description;
  const transactionId = transaction.id;
  const transferId = transaction.transfer_id;
  const category = categoriesById[transaction.categoryId];
  const type = category.types.find((type) => type.id === transaction.type_id);

  const isIncome = isIncomeTransaction(category.transactionType, type?.transactionType);

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

  const rowLabel = transaction.transfer_id ? "Transfer" : category.name;
  const rowType =
    transaction.categoryId === CategoryNumber.balanceCorrection && category.type === "system"
      ? ""
      : `${`(${type?.name})`}`;

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
          {`${rowLabel} `}
          {transaction.type_id && <Label style={styles.typeText}>{rowType}</Label>}
        </Label>
        {hasDescription && (
          <Label numberOfLines={1} style={styles.descriptionText}>
            {transaction.description}
          </Label>
        )}
      </View>
      <View>
        <Label style={[styles.price, isIncome && styles.incomeColor]}>
          {`${formatDecimalDigits(transaction.amount, delimiter, decimal)}`}
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

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
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
      color: theme.colors.muted,
      fontStyle: "italic",
    },
    typeText: {
      fontWeight: "normal",
      color: theme.colors.muted,
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
