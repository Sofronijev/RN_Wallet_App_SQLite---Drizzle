import { useCallback, useEffect, useState } from "react";
import { AppState, Linking } from "react-native";
import * as Notifications from "expo-notifications";

type Status = "granted" | "denied" | "undetermined" | "unknown";

export default function useNotificationPermission() {
  const [status, setStatus] = useState<Status>("unknown");
  const [canAskAgain, setCanAskAgain] = useState(true);

  const check = useCallback(async () => {
    const res = await Notifications.getPermissionsAsync();
    setStatus(res.status);
    setCanAskAgain(res.canAskAgain ?? true);
  }, []);

  useEffect(() => {
    check();
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") check();
    });
    return () => sub.remove();
  }, [check]);

  // iOS only shows the native prompt once — the first denial flips canAskAgain
  // to false forever. Branching on the stored value (not the request result)
  // means a fresh denial doesn't immediately punt the user into Settings.
  const requestOrOpenSettings = useCallback(async () => {
    if (status === "granted") return;
    if (canAskAgain) {
      const res = await Notifications.requestPermissionsAsync();
      setStatus(res.status);
      setCanAskAgain(res.canAskAgain ?? true);
      return;
    }
    await Linking.openSettings();
  }, [canAskAgain, status]);

  return {
    enabled: status === "granted",
    status,
    requestOrOpenSettings,
  };
}
