import { db } from "db";
import { transactions, wallet } from "db/schema";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { addTransaction } from "./transactionQueries";
import { formatIsoDate } from "modules/timeAndDate";
import { CategoryNumber, typeId } from "modules/transactionCategories";

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
  console.log(currentBalance)
  console.log(newBalance)
  console.log(balanceDifference)

  return addTransaction({
    amount: balanceDifference,
    date: formatIsoDate(new Date()),
    categoryId: CategoryNumber.balanceAdjust,
    type_id: typeId.balanceAdjust,
    wallet_id,
  });
};
