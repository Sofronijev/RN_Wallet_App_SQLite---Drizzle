import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import useNotificationPermission from "./useNotificationPermission";

const NotificationPermissionBanner: React.FC = () => {
  const styles = useThemedStyles(themeStyles);
  const { enabled, status, requestOrOpenSettings } = useNotificationPermission();

  if (enabled || status === "unknown") return null;

  return (
    <Pressable style={styles.box} onPress={requestOrOpenSettings}>
      <MaterialIcons name='notifications-off' size={18} style={styles.icon} />
      <Label style={styles.label}>
        {"Notifications are off. Tap to enable reminders for upcoming payments."}
      </Label>
    </Pressable>
  );
};

export default NotificationPermissionBanner;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    box: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 10,
      backgroundColor: theme.colors.cardInner,
      borderRadius: 8,
    },
    icon: {
      color: theme.colors.muted,
    },
    label: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.text,
      lineHeight: 16,
    },
  });
