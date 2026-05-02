import { addMonths, format } from "date-fns";
import { db, DbExecutor, NewTransaction, TransactionType } from "db";
import {
  categories,
  transactions,
  upcomingPaymentContributions,
  upcomingPaymentInstances,
  upcomingPayments,
} from "db/schema";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  inArray,
  lt,
  not,
  sql,
  sum,
} from "drizzle-orm";
import { recomputeInstanceStatus } from "./upcomingPaymentQueries";

const transactionListColumns = {
  ...getTableColumns(transactions),
  linkedPaymentName: upcomingPayments.name,
};

const findLinkedInstanceId = async (
  executor: DbExecutor,
  transactionId: number,
): Promise<number | null> => {
  const [row] = await executor
    .select({ instanceId: upcomingPaymentContributions.instanceId })
    .from(upcomingPaymentContributions)
    .where(eq(upcomingPaymentContributions.transactionId, transactionId));
  return row?.instanceId ?? null;
};

export const getTransactions = (walletId: number, limit?: number, offset?: number) => {
  const query = db
    .select(transactionListColumns)
    .from(transactions)
    .leftJoin(
      upcomingPaymentContributions,
      eq(upcomingPaymentContributions.transactionId, transactions.id)
    )
    .leftJoin(
      upcomingPaymentInstances,
      eq(upcomingPaymentInstances.id, upcomingPaymentContributions.instanceId)
    )
    .leftJoin(
      upcomingPayments,
      eq(upcomingPayments.id, upcomingPaymentInstances.upcomingPaymentId)
    )
    .where(eq(transactions.wallet_id, walletId))
    .orderBy(desc(transactions.date));

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

export const getInfiniteTransactions = async (
  walletId: number,
  page: number,
  pageSize: number,
  categoryIds?: number[],
  typeIds?: number[]
) => {
  const conditions = [eq(transactions.wallet_id, walletId)];

  if (categoryIds && categoryIds.length > 0) {
    conditions.push(inArray(transactions.categoryId, categoryIds));
  }

  if (typeIds && typeIds.length > 0) {
    conditions.push(inArray(transactions.type_id, typeIds));
  }

  const whereClause = and(...conditions);

  // Count query
  const countQuery = await db.select({ count: count() }).from(transactions).where(whereClause);

  // Data query
  const data = await db
    .select(transactionListColumns)
    .from(transactions)
    .leftJoin(
      upcomingPaymentContributions,
      eq(upcomingPaymentContributions.transactionId, transactions.id)
    )
    .leftJoin(
      upcomingPaymentInstances,
      eq(upcomingPaymentInstances.id, upcomingPaymentContributions.instanceId)
    )
    .leftJoin(
      upcomingPayments,
      eq(upcomingPayments.id, upcomingPaymentInstances.upcomingPaymentId)
    )
    .where(whereClause)
    .orderBy(desc(transactions.date))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const totalCount = countQuery[0].count;
  const hasNextPage = page * pageSize < totalCount;

  return {
    data,
    nextPage: hasNextPage ? page + 1 : undefined,
    previousPage: page > 1 ? page - 1 : undefined,
  };
};

export const getMonthlyBalance = async (walletId: number, date: string) => {
  const monthStart = `${date}-01`;
  const nextMonthStart = format(addMonths(new Date(`${date}-01`), 1), "yyyy-MM-01");
  return await db
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
        gte(transactions.date, monthStart),
        lt(transactions.date, nextMonthStart)
      )
    )
    .groupBy(transactions.wallet_id);
};

export type GetMonthlyAmountsType = Awaited<ReturnType<typeof getMonthlyAmountsByCategory>>;

export const getMonthlyAmountsByCategory = async (walletId: number, monthYear: string) => {
  const monthStart = `${monthYear}-01`;
  const nextMonthStart = format(addMonths(new Date(monthStart), 1), "yyyy-MM-01");

  return await db
    .select({
      categoryId: transactions.categoryId,
      totalAmount: sql`ABS(SUM(${transactions.amount}))`.mapWith(transactions.amount), // Ensure totalAmount is always positive
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.wallet_id, walletId),
        gte(transactions.date, monthStart),
        lt(transactions.date, nextMonthStart),
        not(eq(categories.type, "system")),
        not(eq(categories.transactionType, "income"))
      )
    )
    .groupBy(transactions.categoryId)
    .orderBy(desc(sql`ABS(SUM(${transactions.amount}))`));
};

export const getTransactionById = (id: number) =>
  db.query.transactions.findFirst({
    where: sql`${transactions.id} = ${id}`,
    with: {
      category: true,
      type: true,
      upcomingPayment: { columns: { instanceId: true } },
    },
  });

type LinkOpts = {
  linkedUpcomingInstanceId?: number | null;
};

export const addTransaction = async (transaction: NewTransaction, opts?: LinkOpts) => {
  const linkedUpcomingInstanceId = opts?.linkedUpcomingInstanceId ?? null;

  if (linkedUpcomingInstanceId == null) {
    return db.insert(transactions).values(transaction);
  }

  await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(transactions)
      .values(transaction)
      .returning({ id: transactions.id });

    await tx.insert(upcomingPaymentContributions).values({
      instanceId: linkedUpcomingInstanceId,
      transactionId: inserted.id,
    });

    await recomputeInstanceStatus(linkedUpcomingInstanceId, tx);
  });
};

export const deleteTransaction = async (id: number) => {
  await db.transaction(async (tx) => {
    const priorInstanceId = await findLinkedInstanceId(tx, id);

    await tx.delete(transactions).where(eq(transactions.id, id));

    if (priorInstanceId != null) {
      await recomputeInstanceStatus(priorInstanceId, tx);
    }
  });
};

export const editTransaction = async (
  id: number,
  data: Partial<TransactionType>,
  opts?: LinkOpts,
) => {
  const newInstanceId = opts?.linkedUpcomingInstanceId ?? null;

  await db.transaction(async (tx) => {
    const priorInstanceId = await findLinkedInstanceId(tx, id);

    await tx.update(transactions).set(data).where(eq(transactions.id, id));

    if (priorInstanceId !== newInstanceId) {
      if (priorInstanceId != null) {
        await tx
          .delete(upcomingPaymentContributions)
          .where(eq(upcomingPaymentContributions.transactionId, id));
      }
      if (newInstanceId != null) {
        await tx.insert(upcomingPaymentContributions).values({
          instanceId: newInstanceId,
          transactionId: id,
        });
      }
    }

    const toRecompute = new Set<number>();
    if (priorInstanceId != null) toRecompute.add(priorInstanceId);
    if (newInstanceId != null) toRecompute.add(newInstanceId);
    for (const iid of toRecompute) {
      await recomputeInstanceStatus(iid, tx);
    }
  });
};
