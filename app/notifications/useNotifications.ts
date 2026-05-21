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
    // if (lastResponse) {
    //   // TODO - on cold start
    // }

    (async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("payment-reminders", {
          name: "Upcoming payment reminders",
          description: "Reminders for bills and recurring charges",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    })();

    // const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    //   // TODO - on notification received
    // });

    // const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    //   // TODO - on notification tap
    // });

    // return () => {
    //   notificationListener.remove();
    //   responseListener.remove();
    // };
  }, []);
}
