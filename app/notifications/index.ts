import * as Notifications from "expo-notifications";
import { NotificationContentInput, NotificationTriggerInput } from "expo-notifications";

export async function scheduleInAppNotification(
  content: NotificationContentInput,
  trigger: NotificationTriggerInput,
) {
  await Notifications.scheduleNotificationAsync({
    content,
    trigger,
  });
}
