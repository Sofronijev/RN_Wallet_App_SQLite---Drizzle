import { db, DbExecutor, EditUpcomingPayment, NewUpcomingPayment } from "db";
import {
  categories,
  notifications,
  transactions,
  upcomingPaymentContributions,
  upcomingPaymentInstances,
  upcomingPayments,
} from "db/schema";
import { and, asc, desc, eq, getTableColumns, gt, lt, or, sql } from "drizzle-orm";
import { addMonths, format, startOfMonth } from "date-fns";
import { getTodayIsoThreshold } from "app/features/upcomingPayments/modules/upcomingPaymentStatus";
import { getNextDueDate } from "app/modules/upcomingPayments/upcomingPaymentRecurrence";
import { formatIsoDate } from "modules/timeAndDate";
import {
  cancelNotificationsForInstance,
  cancelNotificationsForPayment,
  createNotification,
  rebuildNotificationsForPayment,
  safeScheduleNotifications,
  ScheduleResult,
} from "app/services/notificationQueries";

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

  return safeScheduleNotifications(() => createNotification(paymentRow, instanceRow));
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
      hasSeriesNotifications:
        sql<number>`(SELECT COUNT(*) FROM ${notifications} WHERE ${notifications.entityType} = 'payment-series' AND ${notifications.entityId} = ${upcomingPayments.id})`.mapWith(
          (v) => Number(v) > 0,
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

  return safeScheduleNotifications(() => rebuildNotificationsForPayment(updatedPayment));
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
  return safeScheduleNotifications(() => rebuildNotificationsForPayment(payment));
};

export const recreatePaymentNotifications = async (id: number): Promise<ScheduleResult> => {
  await cancelNotificationsForPayment(id);
  const [payment] = await db
    .select()
    .from(upcomingPayments)
    .where(eq(upcomingPayments.id, id));
  if (!payment) return { ok: true };
  return safeScheduleNotifications(() => rebuildNotificationsForPayment(payment));
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
    await ensureNextInstance(instance.upcomingPaymentId);
  }
};

export const ensureNextInstance = async (
  upcomingPaymentId: number,
  executor: DbExecutor = db
): Promise<string | null> => {
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

  return nextDueDate;
};

export const BACKFILL_LIMIT = 3;

export const catchUpUpcomingPaymentInstances = async () => {
  const todayIso = getTodayIsoThreshold();
  const activePayments = await db
    .select({ id: upcomingPayments.id, staleSince: upcomingPayments.staleSince })
    .from(upcomingPayments)
    .where(eq(upcomingPayments.isActive, true));

  for (const payment of activePayments) {
    if (payment.staleSince != null) continue;

    const [latest] = await db
      .select({ dueDate: upcomingPaymentInstances.dueDate })
      .from(upcomingPaymentInstances)
      .where(eq(upcomingPaymentInstances.upcomingPaymentId, payment.id))
      .orderBy(desc(upcomingPaymentInstances.dueDate))
      .limit(1);

    if (!latest) continue;

    let currentLatest = latest.dueDate;
    let iterations = 0;
    let cappedWithoutCatchingUp = false;

    while (currentLatest < todayIso) {
      if (iterations >= BACKFILL_LIMIT) {
        cappedWithoutCatchingUp = true;
        break;
      }
      const inserted = await ensureNextInstance(payment.id);
      if (!inserted) break;
      currentLatest = inserted;
      iterations++;
    }

    if (cappedWithoutCatchingUp) {
      await db
        .update(upcomingPayments)
        .set({ staleSince: new Date().toISOString() })
        .where(eq(upcomingPayments.id, payment.id));
    }
  }
};

// Caps catch-up so a long-stale daily payment doesn't issue thousands of round-trips
// in a single tap. The next app-open cycle will continue if needed.
const CLEAR_STALE_CATCHUP_LIMIT = 365;

export const clearStaleFlag = async (
  upcomingPaymentId: number,
  executor: DbExecutor = db
) => {
  const todayIso = getTodayIsoThreshold();

  let iterations = 0;
  while (iterations < CLEAR_STALE_CATCHUP_LIMIT) {
    const inserted = await ensureNextInstance(upcomingPaymentId, executor);
    if (!inserted) break;
    iterations++;
    if (inserted >= todayIso) break;
  }

  await executor
    .update(upcomingPayments)
    .set({ staleSince: null })
    .where(eq(upcomingPayments.id, upcomingPaymentId));
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
      await ensureNextInstance(instance.upcomingPaymentId, executor);
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
    })
    .from(upcomingPaymentInstances)
    .leftJoin(
      upcomingPaymentContributions,
      eq(upcomingPaymentContributions.instanceId, upcomingPaymentInstances.id)
    )
    .leftJoin(transactions, eq(transactions.id, upcomingPaymentContributions.transactionId))
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
      hasSeriesNotifications:
        sql<number>`(SELECT COUNT(*) FROM ${notifications} WHERE ${notifications.entityType} = 'payment-series' AND ${notifications.entityId} = ${upcomingPayments.id})`.mapWith(
          (v) => Number(v) > 0,
        ),
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
      hasSeriesNotifications:
        sql<number>`(SELECT COUNT(*) FROM ${notifications} WHERE ${notifications.entityType} = 'payment-series' AND ${notifications.entityId} = ${upcomingPayments.id})`.mapWith(
          (v) => Number(v) > 0,
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
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
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
