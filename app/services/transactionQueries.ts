import { db, NewTransaction } from "db";
import { transactions } from "db/schema";
import { and, eq } from "drizzle-orm";

export const getTransactions = (userId?: number, walletId?: number | null, limit?: number) => {
  const query = db
    .select()
    .from(transactions)
    .where(
      and(
        userId ? eq(transactions.user_id, userId) : undefined,
        walletId ? eq(transactions.wallet_id, walletId) : undefined
      )
    );

  if (limit) {
    query.limit(limit);
  }

  return query;
};

export const addTransaction = (transaction: NewTransaction) =>
  db.insert(transactions).values(transaction);
