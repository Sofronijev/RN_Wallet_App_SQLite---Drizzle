import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./index";
import { db } from "db";
import { addTransfer } from "app/services/transferQueries";
import { addTransaction } from "app/services/transactionQueries";
import { formatIsoDate } from "modules/timeAndDate";
import { CategoryNumber, typeId } from "modules/transactionCategories";
import { getWalletInfo } from "app/services/walletQueries";

type AddTransfer = {
  date: string;
  amountTo: number;
  amountFrom: number;
  walletIdTo: number;
  walletIdFrom: number;
};

export const addTransferMutation = () => {
  const clientQuery = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (transfer: AddTransfer) => addTransferTransactions(transfer),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.transactions] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.monthlyBalance] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.wallets] });
    },
  });

  return {
    addTransfer: mutate,
    isLoading: isPending,
    isError,
  };
};

const addTransferTransactions = async (transfer: AddTransfer) => {
  const { amountFrom, amountTo, date, walletIdFrom, walletIdTo } = transfer;
  const walletFrom = await getWalletInfo(walletIdFrom);
  const walletTo = await getWalletInfo(walletIdTo);

  await db.transaction(async (trx) => {
    const transferFrom = await addTransaction({
      amount: -Math.abs(amountFrom),
      date: formatIsoDate(date),
      type_id: typeId.transfer_send,
      categoryId: CategoryNumber.transfer,
      wallet_id: walletIdFrom,
      description: `Transfer to ${walletTo?.walletName ?? ""}`,
    });

    const transferTo = await addTransaction({
      amount: Math.abs(amountTo),
      date: formatIsoDate(date),
      type_id: typeId.transfer_received,
      categoryId: CategoryNumber.transfer,
      wallet_id: walletIdTo,
      description: `Transfer from ${walletFrom?.walletName ?? ""}`,
    });

    await addTransfer({
      date: formatIsoDate(date),
      fromWalletId: walletIdFrom,
      toWalletId: walletIdTo,
      fromTransactionId: transferFrom.lastInsertRowId,
      toTransactionId: transferTo.lastInsertRowId,
    });
  });
};
