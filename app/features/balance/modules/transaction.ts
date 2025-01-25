import { alertButtonStrings, errorStrings, transactionStrings } from "constants/strings";
import { CategoryNumber, typeIds } from "modules/transactionCategories";
import { ResponseError } from "modules/types";
import { Alert } from "react-native";

export const CATEGORIES_NUMBER_OF_ROWS = 4;
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

export const formatFormAmountValue = (amount: string, categoryId: number, typeId: number) => {
  const amountNumber = Math.abs(Number(amount));
  const isIncome =
    categoryId === CategoryNumber.income ||
    (categoryId === CategoryNumber.balanceCorrection && typeId === typeIds.transfer_received);

  return isIncome ? amountNumber : -amountNumber;
};
