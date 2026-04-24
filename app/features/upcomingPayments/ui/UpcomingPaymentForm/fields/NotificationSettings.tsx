import React from "react";
import { StyleSheet, View } from "react-native";
import Label from "components/Label";
import AppSwitch from "components/AppSwitch";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import SelectableChip from "components/SelectableChip";

const DAYS_BEFORE_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Off" },
  { value: 1, label: "1 day" },
  { value: 2, label: "2 days" },
  { value: 3, label: "3 days" },
  { value: 5, label: "5 days" },
];

type Props = {
  notifyDaysBefore: number | null;
  onNotifyDaysBeforeChange: (value: number | null) => void;
  notifyOnDueDay: boolean;
  onNotifyOnDueDayChange: (value: boolean) => void;
  notifyOnMissed: boolean;
  onNotifyOnMissedChange: (value: boolean) => void;
};

const NotificationSettings: React.FC<Props> = ({
  notifyDaysBefore,
  onNotifyDaysBeforeChange,
  notifyOnDueDay,
  onNotifyOnDueDayChange,
  notifyOnMissed,
  onNotifyOnMissedChange,
}) => {
  const styles = useThemedStyles(themeStyles);

  return (
    <View>
      <Label style={styles.heading}>Notifications</Label>

      <Label style={styles.subLabel}>Remind me before due</Label>
      <View style={styles.chipRow}>
        {DAYS_BEFORE_OPTIONS.map((option) => (
          <SelectableChip
            key={`${option.value ?? "off"}`}
            label={option.label}
            selected={notifyDaysBefore === option.value}
            onPress={() => onNotifyDaysBeforeChange(option.value)}
            compact
          />
        ))}
      </View>

      <View style={styles.switchRow}>
        <Label style={styles.switchLabel}>Notify on due day</Label>
        <AppSwitch value={notifyOnDueDay} onValueChange={onNotifyOnDueDayChange} />
      </View>

      <View style={styles.switchRow}>
        <Label style={styles.switchLabel}>Notify if missed</Label>
        <AppSwitch value={notifyOnMissed} onValueChange={onNotifyOnMissedChange} />
      </View>
    </View>
  );
};

export default NotificationSettings;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    heading: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.colors.muted,
      paddingBottom: 8,
    },
    subLabel: {
      fontSize: 14,
      paddingBottom: 6,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingBottom: 4,
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
    },
    switchLabel: {
      fontSize: 15,
    },
  });
