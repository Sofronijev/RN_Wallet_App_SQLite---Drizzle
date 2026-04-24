import { StyleSheet, View } from "react-native";
import React from "react";
import Label from "components/Label";
import CategoryIcon from "components/CategoryIcon";
import ShadowBoxView from "components/ShadowBoxView";
import { calendarDateFormat, getFormattedDate } from "modules/timeAndDate";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { UpcomingPaymentRow } from "app/queries/upcomingPayments";
import StatusBadge from "components/StatusBadge";

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
        {isActive && completed ? <StatusBadge label='Completed' tone='muted' /> : null}
        {isActive && staleSince ? <StatusBadge label='Stale' tone='danger' /> : null}
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
