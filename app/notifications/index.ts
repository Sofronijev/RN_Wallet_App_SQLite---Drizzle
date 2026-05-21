import * as Notifications from "expo-notifications";
import {
  NotificationContentInput,
  NotificationTriggerInput,
  SchedulableTriggerInputTypes,
} from "expo-notifications";
import { parseISO } from "date-fns";

export const IOS_NOTIFICATION_HARD_CAP = 64;

export const DEFAULT_REMINDER_HOUR = 9;
export const DEFAULT_REMINDER_MINUTE = 0;

export const withReminderTime = (date: Date): Date => {
  const adjusted = new Date(date);
  adjusted.setHours(DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE, 0, 0);
  return adjusted;
};

export const scheduleInAppNotification = async (
  content: NotificationContentInput,
  trigger: NotificationTriggerInput = null,
): Promise<string> => {
  return Notifications.scheduleNotificationAsync({
    content,
    trigger,
  });
};

export const schedulePaymentReminderForDate = (
  content: NotificationContentInput,
  plannedDate: string,
): Promise<string> => {
  const date = withReminderTime(parseISO(plannedDate));
  return scheduleInAppNotification(content, {
    type: SchedulableTriggerInputTypes.DATE,
    date,
    channelId: "payment-reminders",
  });
};

export const schedulePaymentReminderRepeating = (
  content: NotificationContentInput,
  recurrence: "daily" | "weekly",
  anchorDate: string,
): Promise<string> => {
  if (recurrence === "daily") {
    return scheduleInAppNotification(content, {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: DEFAULT_REMINDER_HOUR,
      minute: DEFAULT_REMINDER_MINUTE,
      channelId: "payment-reminders",
    });
  }

  // expo-notifications weekday: 1 = Sunday ... 7 = Saturday
  const weekday = parseISO(anchorDate).getDay() + 1;
  return scheduleInAppNotification(content, {
    type: SchedulableTriggerInputTypes.WEEKLY,
    weekday,
    hour: DEFAULT_REMINDER_HOUR,
    minute: DEFAULT_REMINDER_MINUTE,
    channelId: "payment-reminders",
  });
};

export const getScheduledList = async () => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  return scheduledNotifications;
};

export const cancelScheduledNotification = (osNotificationId: string) =>
  Notifications.cancelScheduledNotificationAsync(osNotificationId);
