import { db, NewTransaction, TransactionType } from "db";
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

export const getMonthlyBalance = (walletId: number | null, date: string) => {
  if (!walletId) return skipQuery(transactions);

  return db
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
};

export const getTransactionById = (id: number | undefined | null) => {
  return db.query.transactions.findFirst({ where: sql`${transactions.id} = ${id}` });
};

export const deleteTransaction = (id: number) => {
  return db.delete(transactions).where(eq(transactions.id, id));
};

export const editTransaction = (id: number, data: Partial<TransactionType>) => {
  return db.update(transactions).set(data).where(eq(transactions.id, id));
};
