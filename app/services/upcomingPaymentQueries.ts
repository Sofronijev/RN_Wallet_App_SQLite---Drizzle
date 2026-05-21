import { db, DbExecutor, EditUpcomingPayment, NewUpcomingPayment } from "db";
import {
  categories,
  transactions,
  upcomingPaymentContributions,
  upcomingPaymentInstances,
  upcomingPayments,
  wallet,
} from "db/schema";
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { addMonths, format, startOfMonth } from "date-fns";
import { getTodayIsoThreshold } from "app/features/upcomingPayments/modules/upcomingPaymentStatus";
import { getNextDueDate } from "app/modules/upcomingPayments/upcomingPaymentRecurrence";
import { formatIsoDate } from "modules/timeAndDate";
import { Recurrence } from "app/features/upcomingPayments/modules/types";
import {
  cancelNotificationsForInstance,
  cancelNotificationsForPayment,
  createNotification,
  rebuildNotificationsForPayment,
  safeScheduleNotifications,
  ScheduleResult,
} from "app/services/notificationQueries";

// How many future pending instances we keep scheduled per recurrence. Each
// instance can hold up to 3 notification triggers, so daily=5 → up to 15 iOS
// slots per payment. The iOS cap is 64, so users with many daily payments may
// hit the limit (surfaced via safeScheduleNotifications + recreate CTA).
const WINDOW_SIZE: Record<Recurrence, number> = {
  none: 1,
  daily: 5,
  weekly: 2,
  monthly: 1,
  yearly: 1,
  custom: 1,
};

// How many past instances we backfill before giving up and flagging the payment
// stale. Daily gets more head-room because a long weekend shouldn't trigger
// "Still using this?". Everything else stales after 3 missed cycles.
const BACKFILL_CAP: Record<Recurrence, number> = {
  none: 3,
  daily: 5,
  weekly: 3,
  monthly: 3,
  yearly: 3,
  custom: 3,
};

const countFuturePending = async (
  upcomingPaymentId: number,
  todayIso: string,
  executor: DbExecutor,
) => {
  const [row] = await executor
    .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
    .from(upcomingPaymentInstances)
    .where(
      and(
        eq(upcomingPaymentInstances.upcomingPaymentId, upcomingPaymentId),
        eq(upcomingPaymentInstances.status, "pending"),
        gte(upcomingPaymentInstances.dueDate, todayIso),
      ),
    );
  return row?.count ?? 0;
};

const insertNextInstance = async (
  upcomingPaymentId: number,
  executor: DbExecutor,
): Promise<{ dueDate: string } | null> => {
  const [payment] = await executor
    .select()
    .from(upcomingPayments)
    .where(eq(upcomingPayments.id, upcomingPaymentId));
  if (!payment || !payment.isActive) return null;

  const [latest] = await executor
    .select({ dueDate: upcomingPaymentInstances.dueDate })
    .from(upcomingPaymentInstances)
    .where(eq(upcomingPaymentInstances.upcomingPaymentId, upcomingPaymentId))
    .orderBy(desc(upcomingPaymentInstances.dueDate))
    .limit(1);
  if (!latest) return null;

  const nextDueDate = getNextDueDate(payment, latest.dueDate);
  if (!nextDueDate) return null;

  const [insertedInstance] = await executor
    .insert(upcomingPaymentInstances)
    .values({
      upcomingPaymentId,
      dueDate: nextDueDate,
      expectedAmount: payment.amount ?? null,
    })
    .onConflictDoNothing()
    .returning();

  if (insertedInstance) {
    await safeScheduleNotifications(() =>
      createNotification(payment, insertedInstance, executor),
    );
  }

  return { dueDate: nextDueDate };
};

// Generates instances forward until we have WINDOW_SIZE pending future instances
// or hit endDate. If we're catching up from far in the past, stops at BACKFILL_CAP
// past iterations and sets staleSince. Safe to call repeatedly — no-op once full.
export const ensureWindow = async (
  upcomingPaymentId: number,
  executor: DbExecutor = db,
): Promise<void> => {
  const [payment] = await executor
    .select({
      id: upcomingPayments.id,
      isActive: upcomingPayments.isActive,
      staleSince: upcomingPayments.staleSince,
      recurrence: upcomingPayments.recurrence,
    })
    .from(upcomingPayments)
    .where(eq(upcomingPayments.id, upcomingPaymentId));
  if (!payment || !payment.isActive || payment.staleSince != null) return;

  const todayIso = getTodayIsoThreshold();
  const windowSize = WINDOW_SIZE[payment.recurrence];
  const backfillCap = BACKFILL_CAP[payment.recurrence];

  let backfillSteps = 0;
  const maxIterations = windowSize + backfillCap + 1;

  for (let i = 0; i < maxIterations; i++) {
    const count = await countFuturePending(upcomingPaymentId, todayIso, executor);
    if (count >= windowSize) return;

    const [latest] = await executor
      .select({ dueDate: upcomingPaymentInstances.dueDate })
      .from(upcomingPaymentInstances)
      .where(eq(upcomingPaymentInstances.upcomingPaymentId, upcomingPaymentId))
      .orderBy(desc(upcomingPaymentInstances.dueDate))
      .limit(1);
    if (!latest) return;

    if (latest.dueDate < todayIso) {
      if (backfillSteps >= backfillCap) {
        await executor
          .update(upcomingPayments)
          .set({ staleSince: new Date().toISOString() })
          .where(eq(upcomingPayments.id, upcomingPaymentId));
        return;
      }
      backfillSteps++;
    }

    const inserted = await insertNextInstance(upcomingPaymentId, executor);
    if (!inserted) return;
  }
};

export const addUpcomingPayment = async (
  payment: NewUpcomingPayment,
): Promise<ScheduleResult> => {
  const { paymentRow, instanceRow } = await db.transaction(async (tx) => {
    const [insertedPayment] = await tx
      .insert(upcomingPayments)
      .values(payment)
      .returning();

    const [insertedInstance] = await tx
      .insert(upcomingPaymentInstances)
      .values({
        upcomingPaymentId: insertedPayment.id,
        dueDate: payment.firstDueDate,
        expectedAmount: payment.amount ?? null,
      })
      .returning();

    return { paymentRow: insertedPayment, instanceRow: insertedInstance };
  });

  return safeScheduleNotifications(async () => {
    await createNotification(paymentRow, instanceRow);
    await ensureWindow(paymentRow.id);
  });
};

export const getUpcomingPaymentById = async (id: number) => {
  const todayIso = getTodayIsoThreshold();
  const [row] = await db
    .select({
      ...getTableColumns(upcomingPayments),
      iconFamily: categories.iconFamily,
      iconName: categories.iconName,
      iconColor: categories.iconColor,
      categoryName: categories.name,
      paidCount:
        sql<number>`COUNT(CASE WHEN ${upcomingPaymentInstances.status} = 'paid' THEN 1 END)`.mapWith(
          Number
        ),
      missedCount:
        sql<number>`COUNT(CASE WHEN ${upcomingPaymentInstances.status} = 'pending' AND ${upcomingPaymentInstances.dueDate} < ${todayIso} THEN 1 END)`.mapWith(
          Number
        ),
      canceledCount:
        sql<number>`COUNT(CASE WHEN ${upcomingPaymentInstances.status} = 'canceled' THEN 1 END)`.mapWith(
          Number
        ),
      pendingCount:
        sql<number>`COUNT(CASE WHEN ${upcomingPaymentInstances.status} = 'pending' AND ${upcomingPaymentInstances.dueDate} >= ${todayIso} THEN 1 END)`.mapWith(
          Number
        ),
      missingInstanceReminderCount: sql<number>`COUNT(CASE WHEN ${upcomingPaymentInstances.status} = 'pending' AND ${upcomingPaymentInstances.dueDate} >= ${todayIso} AND (${upcomingPaymentInstances.notificationIds} IS NULL OR ${upcomingPaymentInstances.notificationIds} = '' OR ${upcomingPaymentInstances.notificationIds} = '[]') THEN 1 END)`.mapWith(
        Number,
      ),
    })
    .from(upcomingPayments)
    .innerJoin(categories, eq(categories.id, upcomingPayments.categoryId))
    .leftJoin(
      upcomingPaymentInstances,
      eq(upcomingPaymentInstances.upcomingPaymentId, upcomingPayments.id)
    )
    .where(eq(upcomingPayments.id, id))
    .groupBy(upcomingPayments.id);

  if (!row) return null;
  const historyCount = row.paidCount + row.missedCount + row.canceledCount;
  return { ...row, historyCount, totalCount: computeTotalCount(row) };
};

const REBUILD_TRIGGER_FIELDS = [
  "name",
  "recurrence",
  "endDate",
  "firstDueDate",
  "notifyDaysBefore",
  "notifyOnDueDay",
  "notifyOnMissed",
  "customIntervalValue",
  "customIntervalUnit",
] as const;

export const updateUpcomingPayment = async (
  id: number,
  values: EditUpcomingPayment,
): Promise<ScheduleResult> => {
  const existing = await getUpcomingPaymentById(id);
  if (!existing) throw new Error("Upcoming payment not found");

  const safeValues: EditUpcomingPayment = { ...values };
  if (existing.historyCount > 0) {
    delete safeValues.currencyCode;
    delete safeValues.currencySymbol;
    delete safeValues.firstDueDate;
  }

  const needsRebuild = REBUILD_TRIGGER_FIELDS.some((field) => {
    const incoming = safeValues[field];
    if (incoming === undefined) return false;
    return incoming !== existing[field];
  });

  await db.update(upcomingPayments).set(safeValues).where(eq(upcomingPayments.id, id));

  if (!needsRebuild) return { ok: true };

  await cancelNotificationsForPayment(id);
  const [updatedPayment] = await db
    .select()
    .from(upcomingPayments)
    .where(eq(upcomingPayments.id, id));
  if (!updatedPayment) return { ok: true };

  // If endDate moved earlier, drop any pending instances now past the new end —
  // their notifications were already cleared by cancelNotificationsForPayment above.
  if (updatedPayment.endDate) {
    await db
      .delete(upcomingPaymentInstances)
      .where(
        and(
          eq(upcomingPaymentInstances.upcomingPaymentId, id),
          eq(upcomingPaymentInstances.status, "pending"),
          gt(upcomingPaymentInstances.dueDate, updatedPayment.endDate),
        ),
      );
  }

  return safeScheduleNotifications(async () => {
    await rebuildNotificationsForPayment(updatedPayment);
    await ensureWindow(id);
  });
};

export const softDeleteUpcomingPayment = async (id: number) => {
  await cancelNotificationsForPayment(id);
  await db.update(upcomingPayments).set({ isActive: false }).where(eq(upcomingPayments.id, id));
};

export const restoreUpcomingPayment = async (id: number): Promise<ScheduleResult> => {
  await db.update(upcomingPayments).set({ isActive: true }).where(eq(upcomingPayments.id, id));

  const [payment] = await db
    .select()
    .from(upcomingPayments)
    .where(eq(upcomingPayments.id, id));
  if (!payment) return { ok: true };
  return safeScheduleNotifications(async () => {
    await rebuildNotificationsForPayment(payment);
    await ensureWindow(id);
  });
};

export const recreatePaymentNotifications = async (id: number): Promise<ScheduleResult> => {
  await cancelNotificationsForPayment(id);
  const [payment] = await db
    .select()
    .from(upcomingPayments)
    .where(eq(upcomingPayments.id, id));
  if (!payment) return { ok: true };
  return safeScheduleNotifications(async () => {
    await rebuildNotificationsForPayment(payment);
    await ensureWindow(id);
  });
};

export const cancelUpcomingPaymentInstance = async (instanceId: number) => {
  const [instance] = await db
    .select({ upcomingPaymentId: upcomingPaymentInstances.upcomingPaymentId })
    .from(upcomingPaymentInstances)
    .where(eq(upcomingPaymentInstances.id, instanceId));

  await cancelNotificationsForInstance(instanceId);

  await db
    .update(upcomingPaymentInstances)
    .set({ status: "canceled", canceledAt: new Date().toISOString() })
    .where(eq(upcomingPaymentInstances.id, instanceId));

  if (instance) {
    await ensureWindow(instance.upcomingPaymentId);
  }
};

export const catchUpUpcomingPaymentInstances = async () => {
  const activePayments = await db
    .select({ id: upcomingPayments.id })
    .from(upcomingPayments)
    .where(and(eq(upcomingPayments.isActive, true), isNull(upcomingPayments.staleSince)));

  await Promise.all(activePayments.map((p) => ensureWindow(p.id)));
};

// Caps catch-up so a long-stale daily payment doesn't issue thousands of round-trips
// in a single tap.
const CLEAR_STALE_CATCHUP_LIMIT = 365;

export const clearStaleFlag = async (
  upcomingPaymentId: number,
  executor: DbExecutor = db,
) => {
  // Reset stale flag first so insertNextInstance / ensureWindow won't skip.
  await executor
    .update(upcomingPayments)
    .set({ staleSince: null })
    .where(eq(upcomingPayments.id, upcomingPaymentId));

  const todayIso = getTodayIsoThreshold();

  // Aggressive catch-up: the user explicitly confirmed they're still using it.
  for (let i = 0; i < CLEAR_STALE_CATCHUP_LIMIT; i++) {
    const inserted = await insertNextInstance(upcomingPaymentId, executor);
    if (!inserted) break;
    if (inserted.dueDate >= todayIso) break;
  }

  // Then fill the forward window.
  await ensureWindow(upcomingPaymentId, executor);
};

export const restoreUpcomingPaymentInstance = async (instanceId: number) => {
  await db
    .update(upcomingPaymentInstances)
    .set({ status: "pending", canceledAt: null })
    .where(eq(upcomingPaymentInstances.id, instanceId));

  const [row] = await db
    .select({
      instance: getTableColumns(upcomingPaymentInstances),
      payment: getTableColumns(upcomingPayments),
    })
    .from(upcomingPaymentInstances)
    .innerJoin(
      upcomingPayments,
      eq(upcomingPayments.id, upcomingPaymentInstances.upcomingPaymentId),
    )
    .where(eq(upcomingPaymentInstances.id, instanceId));

  if (!row) return;
  await safeScheduleNotifications(() => createNotification(row.payment, row.instance));
};

export const recomputeInstanceStatus = async (
  instanceId: number,
  executor: DbExecutor = db
): Promise<void> => {
  const [instance] = await executor
    .select({
      upcomingPaymentId: upcomingPaymentInstances.upcomingPaymentId,
      status: upcomingPaymentInstances.status,
      parentStaleSince: upcomingPayments.staleSince,
    })
    .from(upcomingPaymentInstances)
    .innerJoin(
      upcomingPayments,
      eq(upcomingPayments.id, upcomingPaymentInstances.upcomingPaymentId)
    )
    .where(eq(upcomingPaymentInstances.id, instanceId));
  if (!instance) return;

  const [link] = await executor
    .select({ id: upcomingPaymentContributions.id })
    .from(upcomingPaymentContributions)
    .where(eq(upcomingPaymentContributions.instanceId, instanceId))
    .limit(1);

  const shouldBePaid = link != null;
  const currentlyPaid = instance.status === "paid";

  if (shouldBePaid && !currentlyPaid) {
    await cancelNotificationsForInstance(instanceId, executor);
    await executor
      .update(upcomingPaymentInstances)
      .set({ status: "paid", paidAt: new Date().toISOString() })
      .where(eq(upcomingPaymentInstances.id, instanceId));
    if (instance.parentStaleSince != null) {
      await clearStaleFlag(instance.upcomingPaymentId, executor);
    } else {
      await ensureWindow(instance.upcomingPaymentId, executor);
    }
  } else if (!shouldBePaid && currentlyPaid) {
    await executor
      .update(upcomingPaymentInstances)
      .set({ status: "pending", paidAt: null })
      .where(eq(upcomingPaymentInstances.id, instanceId));

    const [row] = await executor
      .select({
        instance: getTableColumns(upcomingPaymentInstances),
        payment: getTableColumns(upcomingPayments),
      })
      .from(upcomingPaymentInstances)
      .innerJoin(
        upcomingPayments,
        eq(upcomingPayments.id, upcomingPaymentInstances.upcomingPaymentId),
      )
      .where(eq(upcomingPaymentInstances.id, instanceId));

    if (row) {
      await safeScheduleNotifications(() =>
        createNotification(row.payment, row.instance, executor),
      );
    }
  }
};

export const getUpcomingPaymentInstancesWithContributions = async (upcomingPaymentId: number) => {
  const rows = await db
    .select({
      ...getTableColumns(upcomingPaymentInstances),
      transactionAmount: sql<number | null>`SUM(${transactions.amount})`.mapWith((v) =>
        v == null ? null : Number(v),
      ),
      contributionCount: sql<number>`COUNT(${upcomingPaymentContributions.id})`.mapWith(Number),
      // MAX picks one wallet currency per instance — partial multi-wallet
      // payments aren't a supported flow yet, so each instance has at most one.
      paidCurrencyCode: sql<string | null>`MAX(${wallet.currencyCode})`.mapWith((v) =>
        v == null ? null : String(v),
      ),
      paidCurrencySymbol: sql<string | null>`MAX(${wallet.currencySymbol})`.mapWith((v) =>
        v == null ? null : String(v),
      ),
    })
    .from(upcomingPaymentInstances)
    .leftJoin(
      upcomingPaymentContributions,
      eq(upcomingPaymentContributions.instanceId, upcomingPaymentInstances.id)
    )
    .leftJoin(transactions, eq(transactions.id, upcomingPaymentContributions.transactionId))
    .leftJoin(wallet, eq(wallet.walletId, transactions.wallet_id))
    .where(eq(upcomingPaymentInstances.upcomingPaymentId, upcomingPaymentId))
    .groupBy(upcomingPaymentInstances.id)
    .orderBy(desc(upcomingPaymentInstances.dueDate));

  return rows;
};

export const getUpcomingPaymentInstanceWithContext = async (instanceId: number) => {
  const [row] = await db
    .select({
      instanceId: upcomingPaymentInstances.id,
      dueDate: upcomingPaymentInstances.dueDate,
      expectedAmount: upcomingPaymentInstances.expectedAmount,
      status: upcomingPaymentInstances.status,
      upcomingPaymentId: upcomingPayments.id,
      paymentName: upcomingPayments.name,
      paymentDescription: upcomingPayments.description,
      categoryId: upcomingPayments.categoryId,
      typeId: upcomingPayments.typeId,
      currencyCode: upcomingPayments.currencyCode,
      currencySymbol: upcomingPayments.currencySymbol,
    })
    .from(upcomingPaymentInstances)
    .innerJoin(
      upcomingPayments,
      eq(upcomingPayments.id, upcomingPaymentInstances.upcomingPaymentId)
    )
    .where(eq(upcomingPaymentInstances.id, instanceId));

  if (!row) return null;
  return row;
};

export const getLinkablePendingInstances = async (
  categoryId: number,
  includeInstanceId?: number | null,
) => {
  const pendingInCategory = and(
    eq(upcomingPayments.categoryId, categoryId),
    eq(upcomingPaymentInstances.status, "pending"),
  );
  const matchClause =
    includeInstanceId != null
      ? or(pendingInCategory, eq(upcomingPaymentInstances.id, includeInstanceId))
      : pendingInCategory;

  return db
    .select({
      instanceId: upcomingPaymentInstances.id,
      upcomingPaymentId: upcomingPayments.id,
      paymentName: upcomingPayments.name,
      dueDate: upcomingPaymentInstances.dueDate,
      expectedAmount: upcomingPaymentInstances.expectedAmount,
      iconFamily: categories.iconFamily,
      iconName: categories.iconName,
      iconColor: categories.iconColor,
      currencyCode: upcomingPayments.currencyCode,
      currencySymbol: upcomingPayments.currencySymbol,
    })
    .from(upcomingPaymentInstances)
    .innerJoin(
      upcomingPayments,
      eq(upcomingPayments.id, upcomingPaymentInstances.upcomingPaymentId)
    )
    .innerJoin(categories, eq(categories.id, upcomingPayments.categoryId))
    .where(and(eq(upcomingPayments.isActive, true), matchClause))
    .orderBy(asc(upcomingPaymentInstances.dueDate));
};

export const getUpcomingInstancesForSection = async () => {
  const nextMonthIso = format(addMonths(startOfMonth(new Date()), 1), "yyyy-MM-dd");

  return db
    .select({
      id: upcomingPaymentInstances.id,
      upcomingPaymentId: upcomingPaymentInstances.upcomingPaymentId,
      dueDate: upcomingPaymentInstances.dueDate,
      expectedAmount: upcomingPaymentInstances.expectedAmount,
      status: upcomingPaymentInstances.status,
      notificationIds: upcomingPaymentInstances.notificationIds,
      name: upcomingPayments.name,
      staleSince: upcomingPayments.staleSince,
      recurrence: upcomingPayments.recurrence,
      endDate: upcomingPayments.endDate,
      notifyDaysBefore: upcomingPayments.notifyDaysBefore,
      notifyOnDueDay: upcomingPayments.notifyOnDueDay,
      notifyOnMissed: upcomingPayments.notifyOnMissed,
      currencyCode: upcomingPayments.currencyCode,
      currencySymbol: upcomingPayments.currencySymbol,
      iconFamily: categories.iconFamily,
      iconName: categories.iconName,
      iconColor: categories.iconColor,
    })
    .from(upcomingPaymentInstances)
    .innerJoin(
      upcomingPayments,
      eq(upcomingPayments.id, upcomingPaymentInstances.upcomingPaymentId)
    )
    .innerJoin(categories, eq(categories.id, upcomingPayments.categoryId))
    .where(
      and(
        eq(upcomingPayments.isActive, true),
        eq(upcomingPaymentInstances.status, "pending"),
        lt(upcomingPaymentInstances.dueDate, nextMonthIso)
      )
    )
    .orderBy(asc(upcomingPaymentInstances.dueDate));
};

export const getAllUpcomingPayments = async () => {
  const todayIso = getTodayIsoThreshold();
  const rows = await db
    .select({
      ...getTableColumns(upcomingPayments),
      iconFamily: categories.iconFamily,
      iconName: categories.iconName,
      iconColor: categories.iconColor,
      paidCount: sql<number>`COUNT(CASE WHEN ${upcomingPaymentInstances.status} = 'paid' THEN 1 END)`.mapWith(
        Number
      ),
      missedCount: sql<number>`COUNT(CASE WHEN ${upcomingPaymentInstances.status} = 'pending' AND ${upcomingPaymentInstances.dueDate} < ${todayIso} THEN 1 END)`.mapWith(
        Number
      ),
      pendingCount: sql<number>`COUNT(CASE WHEN ${upcomingPaymentInstances.status} = 'pending' THEN 1 END)`.mapWith(
        Number
      ),
      missingInstanceReminderCount: sql<number>`COUNT(CASE WHEN ${upcomingPaymentInstances.status} = 'pending' AND ${upcomingPaymentInstances.dueDate} >= ${todayIso} AND (${upcomingPaymentInstances.notificationIds} IS NULL OR ${upcomingPaymentInstances.notificationIds} = '' OR ${upcomingPaymentInstances.notificationIds} = '[]') THEN 1 END)`.mapWith(
        Number,
      ),
    })
    .from(upcomingPayments)
    .innerJoin(categories, eq(categories.id, upcomingPayments.categoryId))
    .leftJoin(
      upcomingPaymentInstances,
      eq(upcomingPaymentInstances.upcomingPaymentId, upcomingPayments.id)
    )
    .groupBy(upcomingPayments.id);

  return rows.map((row) => ({
    ...row,
    totalCount: computeTotalCount(row),
    completed: isCompleted(row, todayIso),
  }));
};

const isCompleted = (
  row: { endDate: string | null; pendingCount: number },
  todayIso: string,
): boolean => row.endDate != null && row.endDate <= todayIso && row.pendingCount === 0;

type TotalCountInput = {
  firstDueDate: string;
  endDate: string | null;
  recurrence: Recurrence;
  customIntervalValue: number | null;
  customIntervalUnit: "day" | "week" | "month" | null;
};

export const MAX_OCCURRENCES = 10_000;

const computeTotalCount = (row: TotalCountInput): number | null => {
  if (!row.endDate) return null;
  const startIso = formatIsoDate(new Date(row.firstDueDate));
  const endIso = formatIsoDate(new Date(row.endDate));
  if (startIso > endIso) return 0;
  if (row.recurrence === "none") return 1;

  let current: string | null = startIso;
  let count = 1;
  while (count < MAX_OCCURRENCES) {
    const next = getNextDueDate(row, current);
    if (!next) break;
    count++;
    current = next;
  }
  return count;
};
