import React from "react";
import { StyleSheet, View } from "react-native";
import Label from "components/Label";
import ButtonText from "components/ButtonText";
import StatusBadge from "components/StatusBadge";
import { calendarDateFormat, getFormattedDate } from "modules/timeAndDate";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { UpcomingPaymentInstanceRow } from "app/queries/upcomingPayments";
import { formatPaymentAmount } from "../../modules/formatPaymentAmount";

type Props = {
  row: UpcomingPaymentInstanceRow;
  isMissed: boolean;
  paymentCurrency: string;
  decimal: string;
  delimiter: string;
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

type StatusKey = keyof typeof statusMeta;

const HistoryRow: React.FC<Props> = ({
  row,
  isMissed,
  paymentCurrency,
  decimal,
  delimiter,
  onPay,
  onCancel,
  onRestore,
}) => {
  const styles = useThemedStyles(themeStyles);
  const meta = isMissed ? statusMeta.missed : statusMeta[row.status as StatusKey];
  const paidAmount =
    row.transactionAmount != null ? Math.abs(row.transactionAmount) : row.expectedAmount ?? null;
  const isCanceled = row.status === "canceled";
  // When paid, show the wallet's currency (the actual money that moved).
  // When unpaid, fall back to the payment's own currency (the expected amount).
  const currency =
    row.transactionAmount != null
      ? row.paidCurrencySymbol || row.paidCurrencyCode || paymentCurrency
      : paymentCurrency;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <Label style={styles.date}>{getFormattedDate(row.dueDate, calendarDateFormat)}</Label>
          <StatusBadge label={meta.label} tone={meta.tone} />
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
    amount: {
      fontSize: 14,
      fontWeight: "600",
    },
  });
