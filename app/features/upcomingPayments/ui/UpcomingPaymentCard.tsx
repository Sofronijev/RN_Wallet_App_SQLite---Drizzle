import { StyleSheet, View } from "react-native";
import React from "react";
import Label from "components/Label";
import CategoryIcon from "components/CategoryIcon";
import ShadowBoxView from "components/ShadowBoxView";
import { calendarDateFormat, getFormattedDate } from "modules/timeAndDate";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { UpcomingPaymentRow } from "app/queries/upcomingPayments";

type Props = {
  row: UpcomingPaymentRow;
};

const UpcomingPaymentCard: React.FC<Props> = ({ row }) => {
  const styles = useThemedStyles(themedStyles);
  const {
    name,
    iconFamily,
    iconName,
    iconColor,
    firstDueDate,
    endDate,
    totalCount,
    paidCount,
    missedCount,
    staleSince,
    completed,
    isActive,
  } = row;

  return (
    <ShadowBoxView style={styles.container}>
      <View style={styles.header}>
        <CategoryIcon color={iconColor} iconFamily={iconFamily} name={iconName} />
        <Label numberOfLines={1} style={styles.name}>
          {name}
        </Label>
        {isActive && completed ? <Label style={styles.completedBadge}>Completed</Label> : null}
        {isActive && staleSince ? <Label style={styles.staleBadge}>Stale</Label> : null}
      </View>
      <View style={styles.row}>
        <Label style={styles.meta}>Starts</Label>
        <Label style={styles.metaValue}>
          {getFormattedDate(firstDueDate, calendarDateFormat)}
        </Label>
      </View>
      <View style={styles.row}>
        <Label style={styles.meta}>Ends</Label>
        <Label style={styles.metaValue}>
          {endDate ? getFormattedDate(endDate, calendarDateFormat) : "No end date"}
        </Label>
      </View>
      <View style={styles.row}>
        <Label style={styles.meta}>Payments</Label>
        <Label style={styles.metaValue}>
          {[
            totalCount != null ? `${paidCount} of ${totalCount} paid` : `${paidCount} paid`,
            missedCount > 0 ? `${missedCount} missed` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Label>
      </View>
    </ShadowBoxView>
  );
};

export default UpcomingPaymentCard;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      padding: 12,
      gap: 8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 4,
    },
    name: {
      fontSize: 16,
      fontWeight: "bold",
      flex: 1,
    },
    staleBadge: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.colors.redDark,
      borderColor: theme.colors.redDark,
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 1,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    completedBadge: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.colors.muted,
      borderColor: theme.colors.muted,
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 1,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    meta: {
      fontSize: 13,
      color: theme.colors.muted,
    },
    metaValue: {
      fontSize: 13,
      fontWeight: "500",
    },
  });
