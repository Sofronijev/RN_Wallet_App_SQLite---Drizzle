import { getTodayIsoThreshold } from "./upcomingPaymentStatus";

type ExpectFlags = {
  notifyDaysBefore: number | null;
  notifyOnDueDay: boolean;
  notifyOnMissed: boolean;
};

export const paymentExpectsReminders = (payment: ExpectFlags): boolean =>
  Boolean(
    (payment.notifyDaysBefore != null && payment.notifyDaysBefore > 0) ||
      payment.notifyOnDueDay ||
      payment.notifyOnMissed,
  );

const parseNotificationIds = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const instanceHasMissingReminders = (
  payment: ExpectFlags,
  instance: { notificationIds: string | null; dueDate: string },
): boolean => {
  if (!paymentExpectsReminders(payment)) return false;
  // Past instances can't have future reminders — all triggers would be filtered out,
  // so an empty notificationIds is expected, not a problem worth surfacing.
  if (instance.dueDate < getTodayIsoThreshold()) return false;
  return parseNotificationIds(instance.notificationIds).length === 0;
};

export const sectionRowHasMissingReminders = (
  row: ExpectFlags & {
    notificationIds: string | null;
    dueDate: string;
  },
): boolean => instanceHasMissingReminders(row, row);

export const paymentHasMissingReminders = (payment: {
  notifyDaysBefore: number | null;
  notifyOnDueDay: boolean;
  notifyOnMissed: boolean;
  missingInstanceReminderCount: number;
  pendingCount: number;
}): boolean => {
  if (!paymentExpectsReminders(payment)) return false;
  if (payment.pendingCount === 0) return false;
  return payment.missingInstanceReminderCount > 0;
};
