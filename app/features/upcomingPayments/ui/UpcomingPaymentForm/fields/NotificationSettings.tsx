import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Label from "components/Label";
import AppSwitch from "components/AppSwitch";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import colors from "constants/colors";
import { pressableOpacityStyle } from "modules/pressable";

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
        {DAYS_BEFORE_OPTIONS.map((option) => {
          const isSelected = notifyDaysBefore === option.value;
          return (
            <Pressable
              key={`${option.value ?? "off"}`}
              style={pressableOpacityStyle([styles.chip, isSelected && styles.chipSelected])}
              onPress={() => onNotifyDaysBeforeChange(option.value)}
            >
              <Label style={styles.chipText}>{option.label}</Label>
            </Pressable>
          );
        })}
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
    chip: {
      borderColor: theme.colors.border,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 6,
      backgroundColor: theme.colors.cardInner,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    chipSelected: {
      backgroundColor: theme.colors.selected,
      borderColor: theme.colors.primary,
    },
    chipText: {
      fontSize: 14,
      fontWeight: "500",
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
