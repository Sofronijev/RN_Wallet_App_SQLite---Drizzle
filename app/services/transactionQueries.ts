import { format } from "date-fns";
import { db, NewTransaction, TransactionType } from "db";
import { transactions } from "db/schema";
import { and, count, desc, eq, sql, sum } from "drizzle-orm";
import { apiIsoFormat } from "modules/timeAndDate";

export const getTransactions = (walletId: number, limit?: number, offset?: number) => {
  const query = db
    .select()
    .from(transactions)
    .where(eq(transactions.wallet_id, walletId))
    .orderBy(desc(sql`strftime('%Y-%m-%dT%H:%M:%S', ${transactions.date})`));

  if (limit) {
    query.limit(limit);
  }

  if (offset) {
    query.offset(offset);
  }

  const countQuery = db
    .select({ count: count() })
    .from(transactions)
    .where(eq(transactions.wallet_id, walletId));

  return Promise.all([query, countQuery]);
};

export const getInfiniteTransactions = async (walletId: number, page: number, pageSize: number) => {
  const countQuery = await db
    .select({ count: count() })
    .from(transactions)
    .where(eq(transactions.wallet_id, walletId));

  const data = await db
    .select()
    .from(transactions)
    .where(eq(transactions.wallet_id, walletId))
    .orderBy(desc(transactions.date))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const hasNextPage = page * pageSize <= countQuery[0].count;

  return {
    data,
    nextPage: hasNextPage ? page + 1 : undefined,
    previousPage: page > 1 ? page - 1 : undefined,
  };
};

export const getMonthlyBalance = async (walletId: number, date: string) =>
  await db
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

export const getTransactionById = (id: number) =>
  db.query.transactions.findFirst({ where: sql`${transactions.id} = ${id}` });

export const addTransaction = (transaction: NewTransaction) =>
  db.insert(transactions).values(transaction);

export const deleteTransaction = (id: number) =>
  db.delete(transactions).where(eq(transactions.id, id));

export const editTransaction = (id: number, data: Partial<TransactionType>) =>
  db.update(transactions).set(data).where(eq(transactions.id, id));
