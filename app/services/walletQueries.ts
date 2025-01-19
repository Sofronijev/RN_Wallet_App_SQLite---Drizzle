import { db } from "db";
import { transactions, wallet } from "db/schema";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { addTransaction } from "./transactionQueries";
import { formatIsoDate } from "modules/timeAndDate";
import { CategoryNumber, typeIds } from "modules/transactionCategories";
import { formatDecimalDigits } from "modules/numbers";

export const getAllWalletsWithBalance = () =>
  db
    .select({
      ...getTableColumns(wallet),
      currentBalance:
        sql`COALESCE(SUM(${transactions.amount}), 0) + ${wallet.startingBalance}`.mapWith(
          transactions.amount
        ),
    })
    .from(transactions)
    .rightJoin(wallet, eq(wallet.walletId, transactions.wallet_id))
    .groupBy(
      wallet.walletId,
      wallet.startingBalance,
      wallet.walletName,
      wallet.currencyCode,
      wallet.currencySymbol,
      wallet.type
    );

export const setWalletStartingBalance = (walletId: number, amount: number) =>
  db.update(wallet).set({ startingBalance: amount }).where(eq(wallet.walletId, walletId));

export const changeCurrentBalance = (
  wallet_id: number,
  currentBalance: number,
  newBalance: number
) => {
  const balanceDifference = newBalance - currentBalance;
  const isPositive = balanceDifference >= 0;
  const type = isPositive ? typeIds.transfer_received : typeIds.transfer_send;
  const formatNumber = formatDecimalDigits(newBalance);

  return addTransaction({
    amount: balanceDifference,
    categoryId: CategoryNumber.balanceCorrection,
    type_id: type,
    wallet_id,
    date: formatIsoDate(new Date()),
    description: `Balance correction. New balance: ${formatNumber}`,
  });
};

export const getWalletInfo = (walletId: number) => {
  return db.query.wallet.findFirst({
    where: eq(wallet.walletId, walletId),
  });
};

export const setWalletCurrency = (walletId: number, currencyCode: string, currencySymbol: string) =>
  db.update(wallet).set({ currencyCode, currencySymbol }).where(eq(wallet.walletId, walletId));

export const setColorCurrency = (walletId: number, color: string) =>
  db.update(wallet).set({ color }).where(eq(wallet.walletId, walletId));
