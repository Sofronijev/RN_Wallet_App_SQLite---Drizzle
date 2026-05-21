import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Label from "components/Label";
import ShadowBoxView from "components/ShadowBoxView";
import { pressableOpacityStyle } from "modules/pressable";
import { useGetUpcomingInstancesForSection } from "app/queries/upcomingPayments";
import { useAppNavigation } from "navigation/routes";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import {
  getTodayIsoThreshold,
  isInstanceMissed,
} from "../modules/upcomingPaymentStatus";

const formatLine = (missed: number, dueToday: number, singleName: string | null): string => {
  if (missed > 0 && dueToday > 0) {
    return `${missed} overdue · ${dueToday} due today`;
  }
  if (missed > 0) {
    return missed === 1 ? "1 payment overdue" : `${missed} payments overdue`;
  }
  if (dueToday === 1) {
    return singleName ? `${singleName} is due today` : "Payment due today";
  }
  return `${dueToday} payments due today`;
};

const UpcomingPaymentsAlertBanner: React.FC = () => {
  const styles = useThemedStyles(themedStyles);
  const { redDark, muted } = useColors();
  const navigation = useAppNavigation();
  const { data: instances } = useGetUpcomingInstancesForSection();

  const summary = useMemo(() => {
    // Compare the yyyy-MM-dd prefix so a stored full-ISO dueDate with timezone
    // offset still matches today's date-only threshold.
    const todayDate = getTodayIsoThreshold().slice(0, 10);
    let missed = 0;
    let dueToday = 0;
    let dueTodayName: string | null = null;
    for (const row of instances) {
      if (isInstanceMissed(row)) {
        missed++;
        continue;
      }
      if (row.dueDate.slice(0, 10) === todayDate) {
        dueToday++;
        dueTodayName = row.name;
      }
    }
    return {
      missed,
      dueToday,
      singleName: dueToday === 1 ? dueTodayName : null,
    };
  }, [instances]);

  if (summary.missed === 0 && summary.dueToday === 0) return null;

  const onPress = () => {
    navigation.navigate("UpcomingPaymentsMonth");
  };

  return (
    <Pressable onPress={onPress} style={pressableOpacityStyle()}>
      <ShadowBoxView style={styles.container}>
        <MaterialCommunityIcons
          name={summary.missed > 0 ? "alert-circle" : "calendar-clock"}
          size={22}
          color={redDark}
        />
        <Label style={styles.text} numberOfLines={2}>
          {formatLine(summary.missed, summary.dueToday, summary.singleName)}
        </Label>
        <MaterialCommunityIcons name='chevron-right' size={22} color={muted} />
      </ShadowBoxView>
    </Pressable>
  );
};

export default UpcomingPaymentsAlertBanner;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.redDark,
    },
    text: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
    },
  });
