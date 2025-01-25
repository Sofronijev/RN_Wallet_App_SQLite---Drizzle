import * as Yup from "yup";
import { formatIsoDate } from "modules/timeAndDate";
import { CategoriesWithType, CategoryType } from "db";

export const initialTransactionFormValues = {
  date: formatIsoDate(new Date()),
  amount: "",
  description: "",
  category: null,
  type: null,
  walletId: "",
};

export type TransactionFromInputs = {
  date: string;
  amount: string;
  description: string;
  category: CategoriesWithType | null;
  type: CategoryType | null;
  walletId: string;
};

export const transactionValidationSchema = Yup.object({
  date: Yup.string().required().label("Date"),
  amount: Yup.number()
    .typeError("Please enter a valid number for the amount")
    .required("Please enter the transaction amount")
    .moreThan(0, "Amount must be greater than 0")
    .label("Amount"),
  category: Yup.object().required("Please choose a category").nullable().label("Category"),
  type: Yup.object().required().nullable().label("Type"),
  walletId: Yup.number().required().nullable().label("Wallet"),
});
