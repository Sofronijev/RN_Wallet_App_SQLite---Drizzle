import { db } from "db";
import { transactions, wallet } from "db/schema";
import { eq, getTableColumns, sql } from "drizzle-orm";

export const getAllWallets = () => {
  return db.select().from(wallet);
};

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
