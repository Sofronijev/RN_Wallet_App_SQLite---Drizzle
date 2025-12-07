import * as Yup from "yup";
import { Category, Type } from "db";

export type TransactionFromInputs = {
  date: string;
  amount: number;
  description: string;
  category: Category | null;
  type: Type | null;
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
  type: Yup.object()
    .nullable()
    .when("category", (category, schema) => {
      if (category?.id === 12) {
        return schema.required("Balance correction requires selecting an option.");
      }
      return schema.notRequired();
    })
    .label("Type"),
  walletId: Yup.number().required().nullable().label("Wallet"),
});
