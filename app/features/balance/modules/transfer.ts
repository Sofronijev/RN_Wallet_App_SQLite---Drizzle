import { TransferWithTransactions } from "db";
import { formatIsoDate } from "modules/timeAndDate";
import * as Yup from "yup";

export const transactionValidationSchema = Yup.object({
  date: Yup.string().required().label("Date"),
  amountTo: Yup.number()
    .typeError("Please enter a valid number for the amount")
    .required("Please enter the amount to transfer")
    .label("Amount"),
  amountFrom: Yup.number()
    .typeError("Please enter a valid number for the amount")
    .required("Please enter the amount to transfer")
    .label("Amount"),
  walletIdTo: Yup.number().required("Please select the wallet").label("Wallet"),
  walletIdFrom: Yup.number()
    .required("Please select the wallet")
    .label("Wallet")
    .test("notEqual", "Can't transfer funds to the same wallet", function (value) {
      const { walletIdTo } = this.parent;
      return value !== walletIdTo;
    }),
});

export const formatInitialTransferEditData = (transfer: TransferWithTransactions) => {
  return {
    date: formatIsoDate(transfer.date ?? new Date()),
    walletIdFrom: transfer.fromWalletId?.toString() ?? "",
    amountFrom: Math.abs(Number(transfer.fromTransaction?.amount ?? 0)),
    walletIdTo: transfer.toWalletId?.toString() || "",
    amountTo: Math.abs(Number(transfer.toTransaction?.amount ?? 0)),
  };
};
