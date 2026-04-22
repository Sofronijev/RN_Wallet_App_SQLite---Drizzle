import React from "react";
import { StyleSheet, View } from "react-native";
import Label from "components/Label";
import { calendarDateFormat, getFormattedDate } from "modules/timeAndDate";
import { formatDecimalDigits } from "modules/numbers";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { UpcomingPaymentInstanceRow } from "app/queries/upcomingPayments";

type Props = {
  row: UpcomingPaymentInstanceRow;
  currency: string;
  decimal: string;
  delimiter: string;
  isLast: boolean;
};

const statusMeta: Record<
  "paid" | "missed" | "canceled" | "pending",
  { label: string; tone: "success" | "danger" | "muted" }
> = {
  paid: { label: "Paid", tone: "success" },
  missed: { label: "Missed", tone: "danger" },
  canceled: { label: "Canceled", tone: "muted" },
  pending: { label: "Pending", tone: "muted" },
};

const HistoryRow: React.FC<Props> = ({ row, currency, decimal, delimiter, isLast }) => {
  const styles = useThemedStyles(themeStyles);
  const meta = statusMeta[row.status];
  const paidAmount = row.contributionAmount ?? row.transactionAmount ?? row.expectedAmount ?? null;

  return (
    <View style={[styles.container, !isLast && styles.divider]}>
      <View style={styles.left}>
        <Label style={styles.date}>{getFormattedDate(row.dueDate, calendarDateFormat)}</Label>
        <View style={[styles.pill, styles[`pill_${meta.tone}` as const]]}>
          <Label style={[styles.pillText, styles[`pillText_${meta.tone}` as const]]}>
            {meta.label}
          </Label>
        </View>
      </View>
      <Label style={styles.amount}>
        {paidAmount != null ? `${formatDecimalDigits(paidAmount, delimiter, decimal)} ${currency}` : "—"}
      </Label>
    </View>
  );
};

export default HistoryRow;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 12,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.muted,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    date: {
      fontSize: 14,
      fontWeight: "500",
    },
    pill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
    },
    pill_success: {
      borderColor: theme.colors.primary,
    },
    pill_danger: {
      borderColor: theme.colors.redDark,
    },
    pill_muted: {
      borderColor: theme.colors.muted,
    },
    pillText: {
      fontSize: 11,
      fontWeight: "600",
    },
    pillText_success: {
      color: theme.colors.primary,
    },
    pillText_danger: {
      color: theme.colors.redDark,
    },
    pillText_muted: {
      color: theme.colors.muted,
    },
    amount: {
      fontSize: 14,
      fontWeight: "600",
    },
  });
