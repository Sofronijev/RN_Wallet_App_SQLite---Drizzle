import { db } from "db";
import { transactions, wallet } from "db/schema";
import { eq, getTableColumns, sql, sum } from "drizzle-orm";

export const getAllWallets = () => {
  return db.select().from(wallet);
};

export const getAllWalletsWithBalance = () =>
  db
    .select({
      ...getTableColumns(wallet),
      currentBalance: sql`COALESCE(SUM(${transactions.amount}), 0) + ${wallet.startingBalance}`,
    })
    .from(transactions)
    .leftJoin(wallet, eq(wallet.walletId, transactions.wallet_id))
    .groupBy(
      wallet.walletId,
      wallet.startingBalance,
      wallet.walletName,
      wallet.currencyCode,
      wallet.currencySymbol,
      wallet.type
    );
