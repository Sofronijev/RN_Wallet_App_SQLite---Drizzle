import { alertButtonStrings, errorStrings, transactionStrings } from "constants/strings";
import { Category, Type } from "db";
import { ResponseError } from "modules/types";
import { Alert } from "react-native";

export const CATEGORY_ITEM_HEIGHT = 90;

export const handleTransactionError = (error: ResponseError) => {
  if (error.status === 422) {
    return Alert.alert(error.data.message, transactionStrings.noTransaction);
  }
  Alert.alert(transactionStrings.errorAdding, errorStrings.tryAgain);
};

export const deleteTransactionAlert = (onPress: () => void) => {
  Alert.alert(transactionStrings.deleteTransaction, "", [
    {
      text: alertButtonStrings.cancel,
      style: "cancel",
    },
    { text: alertButtonStrings.delete, onPress, style: "destructive" },
  ]);
};

export const formatFormAmountValue = (
  amount: string | number,
  categoryTransactionType: Category["transactionType"],
  typeTransactionType?: Type["transactionType"]
) => {
  const amountNumber = Math.abs(Number(amount));
  const isIncome = isIncomeTransaction(categoryTransactionType, typeTransactionType);

  return isIncome ? amountNumber : -amountNumber;
};

export const isIncomeTransaction = (
  categoryTransactionType: Category["transactionType"],
  typeTransactionType?: Type["transactionType"]
): boolean => {
  if (categoryTransactionType === "income") {
    return true;
  }

  if (categoryTransactionType === "custom") {
    return typeTransactionType === "income";
  }

  return false;
};
