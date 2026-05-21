type ExpectFlags = {
  notifyDaysBefore: number | null;
  notifyOnDueDay: boolean;
  notifyOnMissed: boolean;
};

type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";

export const paymentExpectsReminders = (payment: ExpectFlags): boolean =>
  Boolean(
    (payment.notifyDaysBefore != null && payment.notifyDaysBefore > 0) ||
      payment.notifyOnDueDay ||
      payment.notifyOnMissed,
  );

export const isSeriesMode = (payment: {
  recurrence: Recurrence;
  endDate: string | null;
}): boolean =>
  (payment.recurrence === "daily" || payment.recurrence === "weekly") && payment.endDate == null;

// Mirrors what scheduleForNewSeries actually schedules: due-day always counts;
// lead time only counts for weekly. notifyOnMissed is not honored in series mode.
export const seriesExpectsReminders = (
  payment: ExpectFlags & { recurrence: Recurrence },
): boolean =>
  payment.notifyOnDueDay ||
  (payment.recurrence === "weekly" &&
    payment.notifyDaysBefore != null &&
    payment.notifyDaysBefore > 0);

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
  instance: { notificationIds: string | null },
): boolean => {
  if (!paymentExpectsReminders(payment)) return false;
  return parseNotificationIds(instance.notificationIds).length === 0;
};

// Combines series-vs-instance mode into a single "is this row missing its reminders" check.
// For series-mode payments notifications live at the series level (hasSeriesNotifications);
// for everything else they live on each instance's notificationIds blob.
export const sectionRowHasMissingReminders = (
  row: ExpectFlags & {
    recurrence: Recurrence;
    endDate: string | null;
    notificationIds: string | null;
    hasSeriesNotifications: boolean;
  },
): boolean => {
  if (isSeriesMode(row)) {
    return seriesExpectsReminders(row) && !row.hasSeriesNotifications;
  }
  return instanceHasMissingReminders(row, row);
};

export const paymentHasMissingReminders = (payment: {
  recurrence: Recurrence;
  endDate: string | null;
  notifyDaysBefore: number | null;
  notifyOnDueDay: boolean;
  notifyOnMissed: boolean;
  hasSeriesNotifications: boolean;
  missingInstanceReminderCount: number;
  pendingCount: number;
}): boolean => {
  if (isSeriesMode(payment)) {
    return seriesExpectsReminders(payment) && !payment.hasSeriesNotifications;
  }
  if (!paymentExpectsReminders(payment)) return false;
  if (payment.pendingCount === 0) return false;
  return payment.missingInstanceReminderCount > 0;
};
