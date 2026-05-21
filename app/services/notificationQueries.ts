import {
  cancelScheduledNotification,
  getScheduledList,
  IOS_NOTIFICATION_HARD_CAP,
  schedulePaymentReminderForDate,
  schedulePaymentReminderRepeating,
  withReminderTime,
} from "app/notifications";
import {
  db,
  DbExecutor,
  NewNotification,
  UpcomingPayment,
  UpcomingPaymentInstance,
} from "db";
import { notifications, upcomingPaymentInstances } from "db/schema";
import { addDays, parseISO } from "date-fns";
import { formatIsoDate } from "modules/timeAndDate";
import { and, asc, eq, gte, inArray, or } from "drizzle-orm";
import { Platform } from "react-native";
import { getTodayIsoThreshold } from "app/features/upcomingPayments/modules/upcomingPaymentStatus";

export type ScheduleResult =
  | { ok: true }
  | { ok: false; reason: "limit" | "error"; message: string };

const LIMIT_ERROR_MARKER = "limit reached";

// Scheduling can fail (iOS slot cap, missing permission). Don't let those
// failures roll back the user's save — DB state is the source of truth.
// Returns a result so user-facing callers can surface an alert.
export const safeScheduleNotifications = async (
  fn: () => Promise<void>,
  context: string,
): Promise<ScheduleResult> => {
  try {
    await fn();
    return { ok: true };
  } catch (err) {
    console.warn(`[notifications] ${context} failed:`, err);
    const message = err instanceof Error ? err.message : String(err);
    const reason = message.toLowerCase().includes(LIMIT_ERROR_MARKER) ? "limit" : "error";
    return { ok: false, reason, message };
  }
};

const addNotification = (
  newNotification: NewNotification,
  executor: DbExecutor = db,
) => executor.insert(notifications).values(newNotification);

const hasExistingNotifications = (notificationIds: string | null): boolean => {
  if (!notificationIds) return false;
  try {
    const parsed = JSON.parse(notificationIds);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
};

const isSeriesMode = (payment: Pick<UpcomingPayment, "recurrence" | "endDate">) =>
  (payment.recurrence === "daily" || payment.recurrence === "weekly") &&
  payment.endDate == null;

type InstanceTrigger =
  | { kind: "lead"; date: string; daysBefore: number }
  | { kind: "due"; date: string }
  | { kind: "missed"; date: string };

const instanceBody = (trigger: InstanceTrigger): string => {
  if (trigger.kind === "missed") return "Payment overdue";
  if (trigger.kind === "due") return "Payment due today";
  if (trigger.daysBefore === 1) return "Payment due tomorrow";
  return `Payment due in ${trigger.daysBefore} days`;
};

const buildContent = (
  payment: Pick<UpcomingPayment, "id" | "name">,
  instance?: Pick<UpcomingPaymentInstance, "id">,
  trigger?: InstanceTrigger,
) => {
  const data: Record<string, string> = { paymentId: String(payment.id) };
  if (instance) data.instanceId = String(instance.id);
  return {
    title: payment.name,
    body: instance && trigger ? instanceBody(trigger) : "Recurring payment reminder",
    data,
  };
};

const ensureIosSlots = async (slotsNeeded: number) => {
  if (Platform.OS !== "ios") return;
  const scheduled = await getScheduledList();
  const slotsLeft = IOS_NOTIFICATION_HARD_CAP - scheduled.length;
  if (slotsLeft < slotsNeeded) {
    throw new Error("Not possible to create new notification, limit reached");
  }
};

const computeInstanceTriggerDates = (
  payment: Pick<UpcomingPayment, "notifyDaysBefore" | "notifyOnDueDay" | "notifyOnMissed">,
  dueDate: string,
): InstanceTrigger[] => {
  const triggers: InstanceTrigger[] = [];
  const due = parseISO(dueDate);
  const now = new Date();

  if (payment.notifyDaysBefore && payment.notifyDaysBefore > 0) {
    const triggerDate = addDays(due, -payment.notifyDaysBefore);
    if (withReminderTime(triggerDate) > now) {
      triggers.push({
        kind: "lead",
        date: formatIsoDate(triggerDate),
        daysBefore: payment.notifyDaysBefore,
      });
    }
  }
  if (payment.notifyOnDueDay && withReminderTime(due) > now) {
    triggers.push({ kind: "due", date: formatIsoDate(due) });
  }
  if (payment.notifyOnMissed) {
    const missedDate = addDays(due, 1);
    if (withReminderTime(missedDate) > now) {
      triggers.push({ kind: "missed", date: formatIsoDate(missedDate) });
    }
  }
  return triggers;
};

const scheduleForNewInstance = async (
  payment: UpcomingPayment,
  instance: Pick<UpcomingPaymentInstance, "id" | "dueDate" | "notificationIds">,
  executor: DbExecutor,
) => {
  if (hasExistingNotifications(instance.notificationIds)) return;

  const triggers = computeInstanceTriggerDates(payment, instance.dueDate);
  if (triggers.length === 0) return;

  await ensureIosSlots(triggers.length);

  const osIds: string[] = [];

  // Persist after each successful schedule so a mid-loop throw leaves
  // notificationIds consistent with what was actually scheduled.
  for (const trigger of triggers) {
    const content = buildContent(payment, instance, trigger);
    const osId = await schedulePaymentReminderForDate(content, trigger.date);
    osIds.push(osId);
    await addNotification(
      {
        title: content.title,
        body: content.body,
        data: JSON.stringify(content.data),
        osNotificationId: osId,
        entityType: "payment-instance",
        entityId: instance.id,
        scheduledFor: trigger.date,
      },
      executor,
    );
    await executor
      .update(upcomingPaymentInstances)
      .set({ notificationIds: JSON.stringify(osIds) })
      .where(eq(upcomingPaymentInstances.id, instance.id));
  }
};

const scheduleForNewSeries = async (payment: UpcomingPayment, executor: DbExecutor) => {
  if (payment.recurrence !== "daily" && payment.recurrence !== "weekly") return;

  const existing = await executor
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.entityType, "payment-series"),
        eq(notifications.entityId, payment.id),
      ),
    )
    .limit(1);
  if (existing.length > 0) return;

  const anchors: string[] = [];
  if (payment.notifyOnDueDay) {
    anchors.push(payment.firstDueDate);
  }
  if (
    payment.recurrence === "weekly" &&
    payment.notifyDaysBefore &&
    payment.notifyDaysBefore > 0
  ) {
    anchors.push(
      formatIsoDate(addDays(parseISO(payment.firstDueDate), -payment.notifyDaysBefore)),
    );
  }
  if (anchors.length === 0) return;

  await ensureIosSlots(anchors.length);

  const content = buildContent(payment);

  for (const anchor of anchors) {
    const osId = await schedulePaymentReminderRepeating(content, payment.recurrence, anchor);
    await addNotification(
      {
        title: content.title,
        body: content.body,
        data: JSON.stringify(content.data),
        osNotificationId: osId,
        entityType: "payment-series",
        entityId: payment.id,
        scheduledFor: anchor,
      },
      executor,
    );
  }
};

export const createNotification = async (
  payment: UpcomingPayment,
  instance?: Pick<UpcomingPaymentInstance, "id" | "dueDate" | "notificationIds">,
  executor: DbExecutor = db,
) => {
  if (isSeriesMode(payment)) {
    await scheduleForNewSeries(payment, executor);
    return;
  }
  if (!instance) return;
  await scheduleForNewInstance(payment, instance, executor);
};

const cancelOsNotificationsByIds = async (osIds: string[]) => {
  for (const osId of osIds) {
    try {
      await cancelScheduledNotification(osId);
    } catch {
      // OS may have already fired/cleared the notification; ignore.
    }
  }
};

export const cancelNotificationsForInstance = async (
  instanceId: number,
  executor: DbExecutor = db,
) => {
  const rows = await executor
    .select({ id: notifications.id, osNotificationId: notifications.osNotificationId })
    .from(notifications)
    .where(
      and(
        eq(notifications.entityType, "payment-instance"),
        eq(notifications.entityId, instanceId),
      ),
    );

  const osIds = rows.map((r) => r.osNotificationId).filter((v): v is string => v != null);
  await cancelOsNotificationsByIds(osIds);

  if (rows.length > 0) {
    await executor
      .delete(notifications)
      .where(
        and(
          eq(notifications.entityType, "payment-instance"),
          eq(notifications.entityId, instanceId),
        ),
      );
  }

  await executor
    .update(upcomingPaymentInstances)
    .set({ notificationIds: null })
    .where(eq(upcomingPaymentInstances.id, instanceId));
};

export const cancelNotificationsForPayment = async (
  paymentId: number,
  executor: DbExecutor = db,
) => {
  const instanceRows = await executor
    .select({ id: upcomingPaymentInstances.id })
    .from(upcomingPaymentInstances)
    .where(eq(upcomingPaymentInstances.upcomingPaymentId, paymentId));
  const instanceIds = instanceRows.map((r) => r.id);

  const whereInstance =
    instanceIds.length > 0
      ? and(
          eq(notifications.entityType, "payment-instance"),
          inArray(notifications.entityId, instanceIds),
        )
      : undefined;

  const whereSeries = and(
    eq(notifications.entityType, "payment-series"),
    eq(notifications.entityId, paymentId),
  );

  const where = whereInstance ? or(whereSeries, whereInstance) : whereSeries;

  const rows = await executor
    .select({ id: notifications.id, osNotificationId: notifications.osNotificationId })
    .from(notifications)
    .where(where);

  const osIds = rows.map((r) => r.osNotificationId).filter((v): v is string => v != null);
  await cancelOsNotificationsByIds(osIds);

  if (rows.length > 0) {
    await executor.delete(notifications).where(where);
  }

  if (instanceIds.length > 0) {
    await executor
      .update(upcomingPaymentInstances)
      .set({ notificationIds: null })
      .where(inArray(upcomingPaymentInstances.id, instanceIds));
  }
};

export const rebuildNotificationsForPayment = async (
  payment: UpcomingPayment,
  executor: DbExecutor = db,
) => {
  if (isSeriesMode(payment)) {
    await createNotification(payment, undefined, executor);
    return;
  }

  const todayIso = getTodayIsoThreshold();
  const pending = await executor
    .select({
      id: upcomingPaymentInstances.id,
      dueDate: upcomingPaymentInstances.dueDate,
      notificationIds: upcomingPaymentInstances.notificationIds,
    })
    .from(upcomingPaymentInstances)
    .where(
      and(
        eq(upcomingPaymentInstances.upcomingPaymentId, payment.id),
        eq(upcomingPaymentInstances.status, "pending"),
        gte(upcomingPaymentInstances.dueDate, todayIso),
      ),
    )
    .orderBy(asc(upcomingPaymentInstances.dueDate));

  for (const instance of pending) {
    await createNotification(payment, instance, executor);
  }
};
