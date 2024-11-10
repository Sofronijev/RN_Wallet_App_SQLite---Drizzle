import { db, NewTransaction } from "db";
import { transactions } from "db/schema";
import { and, eq, sql, sum } from "drizzle-orm";
import { skipQuery } from "./helpers";

export const getTransactions = (walletId: number | null, limit?: number) => {
  if (!walletId) return skipQuery(transactions);

  const query = db
    .select()
    .from(transactions)
    .where(and(eq(transactions.wallet_id, walletId)));

  if (limit) {
    query.limit(limit);
  }

  return query;
};

export const addTransaction = (transaction: NewTransaction) =>
  db.insert(transactions).values(transaction);

export const getMonthlyBalance = (walletId: number, date: string) =>
  db
    .select({
      expense:
        sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
          transactions.amount
        ),
      income:
        sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
          transactions.amount
        ),
      balance: sum(transactions.amount).mapWith(transactions.amount),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.wallet_id, walletId),
        sql` strftime('%Y', ${transactions.date}) = strftime('%Y', ${date})`,
        sql` strftime('%m', ${transactions.date}) = strftime('%m', ${date})`
      )
    )
    .groupBy(transactions.wallet_id);
