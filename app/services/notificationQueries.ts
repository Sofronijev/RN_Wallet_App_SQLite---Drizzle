import {
  cancelScheduledNotification,
  getScheduledList,
  IOS_NOTIFICATION_HARD_CAP,
  schedulePaymentReminderForDate,
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
import { and, asc, eq, gte, inArray } from "drizzle-orm";
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
): Promise<ScheduleResult> => {
  try {
    await fn();
    return { ok: true };
  } catch (err) {
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
  instance: Pick<UpcomingPaymentInstance, "id">,
  trigger: InstanceTrigger,
) => ({
  title: payment.name,
  body: instanceBody(trigger),
  data: { paymentId: String(payment.id), instanceId: String(instance.id) },
});

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

export const createNotification = async (
  payment: UpcomingPayment,
  instance: Pick<UpcomingPaymentInstance, "id" | "dueDate" | "notificationIds">,
  executor: DbExecutor = db,
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
    const osId = await schedulePaymentReminderForDate(
      { title: content.title, body: content.body, data: content.data },
      trigger.date,
    );
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

  if (instanceIds.length === 0) return;

  const where = and(
    eq(notifications.entityType, "payment-instance"),
    inArray(notifications.entityId, instanceIds),
  );

  const rows = await executor
    .select({ id: notifications.id, osNotificationId: notifications.osNotificationId })
    .from(notifications)
    .where(where);

  const osIds = rows.map((r) => r.osNotificationId).filter((v): v is string => v != null);
  await cancelOsNotificationsByIds(osIds);

  if (rows.length > 0) {
    await executor.delete(notifications).where(where);
  }

  await executor
    .update(upcomingPaymentInstances)
    .set({ notificationIds: null })
    .where(inArray(upcomingPaymentInstances.id, instanceIds));
};

export const rebuildNotificationsForPayment = async (
  payment: UpcomingPayment,
  executor: DbExecutor = db,
) => {
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
