import React from "react";
import { StyleSheet, View } from "react-native";
import Label from "components/Label";
import ButtonText from "components/ButtonText";
import { calendarDateFormat, getFormattedDate } from "modules/timeAndDate";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { UpcomingPaymentInstanceRow } from "app/queries/upcomingPayments";
import { formatPaymentAmount } from "../../modules/formatPaymentAmount";

type Props = {
  row: UpcomingPaymentInstanceRow;
  isMissed: boolean;
  currency: string;
  decimal: string;
  delimiter: string;
  isLast: boolean;
  onPay: (instanceId: number) => void;
  onCancel: (instanceId: number) => void;
  onRestore: (instanceId: number) => void;
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

const HistoryRow: React.FC<Props> = ({
  row,
  isMissed,
  currency,
  decimal,
  delimiter,
  isLast,
  onPay,
  onCancel,
  onRestore,
}) => {
  const styles = useThemedStyles(themeStyles);
  const meta = isMissed ? statusMeta.missed : statusMeta[row.status];
  const paidAmount =
    row.transactionAmount != null ? Math.abs(row.transactionAmount) : row.expectedAmount ?? null;
  const isCanceled = row.status === "canceled";

  return (
    <View style={[styles.container, !isLast && styles.divider]}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <Label style={styles.date}>{getFormattedDate(row.dueDate, calendarDateFormat)}</Label>
          <View style={[styles.pill, styles[`pill_${meta.tone}` as const]]}>
            <Label style={[styles.pillText, styles[`pillText_${meta.tone}` as const]]}>
              {meta.label}
            </Label>
          </View>
        </View>
        <Label style={styles.amount}>
          {formatPaymentAmount(paidAmount, { delimiter, decimal, currency })}
        </Label>
      </View>
      {isMissed && (
        <View style={styles.actionRow}>
          <ButtonText
            title='Pay'
            onPress={() => onPay(row.id)}
            buttonStyle={styles.actionText}
          />
          <ButtonText
            title='Cancel'
            type='danger'
            onPress={() => onCancel(row.id)}
            buttonStyle={styles.actionText}
          />
        </View>
      )}
      {isCanceled && (
        <View style={styles.actionRow}>
          <ButtonText
            title='Restore'
            onPress={() => onRestore(row.id)}
            buttonStyle={styles.actionText}
          />
        </View>
      )}
    </View>
  );
};

export default HistoryRow;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 8,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 20,
    },
    actionText: {
      fontSize: 13,
      fontWeight: "600",
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
