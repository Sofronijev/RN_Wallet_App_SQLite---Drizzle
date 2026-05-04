import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function useNotifications() {
  useEffect(() => {
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      console.log("COLD_START", lastResponse)
    }

    (async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("payment-reminders", {
          name: "Upcoming payment reminders",
          description: "Reminders for bills and recurring charges",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
      await Notifications.requestPermissionsAsync();
    })();

    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("RECIEVED", notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("ON TAP", response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);
}
