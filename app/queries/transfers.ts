import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./index";
import { db } from "db";
import { addTransfer, getTransferId } from "app/services/transferQueries";
import { addTransaction } from "app/services/transactionQueries";
import { formatIsoDate } from "modules/timeAndDate";
import { CategoryNumber, typeIds } from "modules/transactionCategories";
import { getWalletInfo } from "app/services/walletQueries";
import { transactions, transfer } from "db/schema";
import { eq } from "drizzle-orm";

type AddTransfer = {
  date: string;
  amountTo: number;
  amountFrom: number;
  walletIdTo: number;
  walletIdFrom: number;
};

type EditTransfer = AddTransfer & {
  fromTransactionId: number;
  toTransactionId: number;
  transferId: number;
};

type DeleteTransfer = { transferId: number; fromTransactionId: number; toTransactionId: number };

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

export const editTransferMutation = () => {
  const clientQuery = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (transfer: EditTransfer) => editTransferTransactions(transfer),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.transactions] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.monthlyBalance] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.wallets] });
    },
  });

  return {
    editTransfer: mutate,
    isLoading: isPending,
    isError,
  };
};

export const deleteTransferMutation = () => {
  const clientQuery = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: DeleteTransfer) => deleteTransferTransactions(data),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.transactions] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.monthlyBalance] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.wallets] });
    },
  });

  return {
    deleteTransfer: mutate,
    isLoading: isPending,
    isError,
  };
};

const addTransferTransactions = async (transferData: AddTransfer) => {
  const { amountFrom, amountTo, date, walletIdFrom, walletIdTo } = transferData;
  const walletFrom = await getWalletInfo(walletIdFrom);
  const walletTo = await getWalletInfo(walletIdTo);

  // create 2 transactions and transfer
  await db.transaction(async (trx) => {
    const transferFrom = await trx.insert(transactions).values({
      amount: -Math.abs(amountFrom),
      date: formatIsoDate(date),
      type_id: typeIds.transfer_send,
      categoryId: CategoryNumber.balanceCorrection,
      wallet_id: walletIdFrom,
      description: `Transfer to ${walletTo?.walletName ?? ""}`,
    });

    const transferTo = await trx.insert(transactions).values({
      amount: Math.abs(amountTo),
      date: formatIsoDate(date),
      type_id: typeIds.transfer_received,
      categoryId: CategoryNumber.balanceCorrection,
      wallet_id: walletIdTo,
      description: `Transfer from ${walletFrom?.walletName ?? ""}`,
    });

    const newTransfer = await trx.insert(transfer).values({
      date: formatIsoDate(date),
      fromWalletId: walletIdFrom,
      toWalletId: walletIdTo,
      fromTransactionId: transferFrom.lastInsertRowId,
      toTransactionId: transferTo.lastInsertRowId,
    });
    // update transactions with transfer id
    await trx
      .update(transactions)
      .set({ transfer_id: newTransfer.lastInsertRowId })
      .where(eq(transactions.id, transferFrom.lastInsertRowId));
    await trx
      .update(transactions)
      .set({ transfer_id: newTransfer.lastInsertRowId })
      .where(eq(transactions.id, transferTo.lastInsertRowId));
  });
};

const editTransferTransactions = async (transferData: EditTransfer) => {
  const {
    amountFrom,
    amountTo,
    date,
    walletIdFrom,
    walletIdTo,
    fromTransactionId,
    toTransactionId,
    transferId,
  } = transferData;

  await db.transaction(async (trx) => {
    await trx
      .update(transfer)
      .set({ date: formatIsoDate(date), fromWalletId: walletIdFrom, toWalletId: walletIdTo })
      .where(eq(transfer.id, transferId));

    await trx
      .update(transactions)
      .set({ date: formatIsoDate(date), wallet_id: walletIdFrom, amount: -Math.abs(amountFrom) })
      .where(eq(transactions.id, fromTransactionId));
    await trx
      .update(transactions)
      .set({ date: formatIsoDate(date), wallet_id: walletIdTo, amount: Math.abs(amountTo) })
      .where(eq(transactions.id, toTransactionId));
  });
};

const deleteTransferTransactions = async (data: DeleteTransfer) => {
  const { transferId, fromTransactionId, toTransactionId } = data;
  await db.transaction(async (trx) => {
    await trx.delete(transactions).where(eq(transactions.id, fromTransactionId));
    await trx.delete(transactions).where(eq(transactions.id, toTransactionId));
    await trx.delete(transfer).where(eq(transfer.id, transferId));
  });
};

export const useGetTransferByIdQuery = (transferId: number | null | undefined) => {
  const { data, isLoading, isFetching, isError, error, status } = useQuery({
    enabled: !!transferId,
    queryKey: [queryKeys.transferId, transferId],
    queryFn: transferId ? () => getTransferId(transferId) : skipToken,
  });

  return {
    data,
    isLoading: isLoading || isFetching,
    isError,
  };
};
