import React, { useEffect, useMemo } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { parseISO } from "date-fns";
import { AppStackParamList } from "navigation/routes";
import Label from "components/Label";
import ShadowBoxView from "components/ShadowBoxView";
import HeaderIcon from "components/Header/HeaderIcon";
import { getCategoryIcon } from "components/CategoryIcon";
import AppActivityIndicator from "components/AppActivityIndicator";
import colors from "constants/colors";
import { calendarDateFormat, dueDateFormat, getFormattedDate } from "modules/timeAndDate";
import { formatDecimalDigits } from "modules/numbers";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import {
  useDeleteUpcomingPaymentMutation,
  useGetUpcomingPaymentById,
  useGetUpcomingPaymentInstances,
} from "app/queries/upcomingPayments";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import HistoryRow from "./details/HistoryRow";

type Props = {
  navigation: StackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, "UpcomingPaymentDetails">;
};

const recurrenceLabel = (
  recurrence: string,
  customValue: number | null,
  customUnit: "day" | "week" | "month" | null
) => {
  switch (recurrence) {
    case "none":
      return "One-time";
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "yearly":
      return "Yearly";
    case "custom":
      if (!customValue || !customUnit) return "Custom";
      return `Every ${customValue} ${customUnit}${customValue === 1 ? "" : "s"}`;
    default:
      return recurrence;
  }
};

const daysUntil = (iso: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseISO(iso);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 0) return `in ${diff} days`;
  return `${Math.abs(diff)} days ago`;
};

const UpcomingPaymentDetails: React.FC<Props> = ({ navigation, route }) => {
  const id = route.params.id;
  const styles = useThemedStyles(themeStyles);
  const themeColors = useColors();
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const { data: payment, isLoading: paymentLoading } = useGetUpcomingPaymentById(id);
  const { data: instances, isLoading: instancesLoading } = useGetUpcomingPaymentInstances(id);
  const { deleteUpcomingPayment, isLoading: isDeleting } = useDeleteUpcomingPaymentMutation();

  const nextPending = useMemo(
    () =>
      instances
        .filter((row) => row.status === "pending")
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0],
    [instances]
  );

  const historyRows = useMemo(
    () => instances.filter((row) => row.status !== "pending"),
    [instances]
  );

  const onEdit = () => navigation.navigate("UpcomingPayment", { id });

  const onDelete = () => {
    if (!payment) return;
    Alert.alert(
      "Delete this upcoming payment?",
      "The schedule will stop. Already-paid transactions will stay in your history.",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteUpcomingPayment(id, {
              onSuccess: () => navigation.goBack(),
            }),
        },
      ]
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <HeaderIcon onPress={onEdit}>
            <MaterialIcons name='edit' size={22} color={colors.white} />
          </HeaderIcon>
          <HeaderIcon onPress={onDelete}>
            <Ionicons name='trash-sharp' size={22} color={colors.white} />
          </HeaderIcon>
        </View>
      ),
    });
  }, [navigation, payment?.id]);

  if (!payment) {
    return <AppActivityIndicator hideScreen isLoading={paymentLoading} />;
  }

  const isVariable = payment.amount == null;
  const currency = payment.currencySymbol || payment.currencyCode;
  const categoryIcon = getCategoryIcon({
    iconFamily: payment.iconFamily,
    name: payment.iconName,
    color: payment.iconColor,
    iconSize: 32,
  });

  const scheduleParts = [
    recurrenceLabel(payment.recurrence, payment.customIntervalValue, payment.customIntervalUnit),
    payment.endDate ? `until ${getFormattedDate(payment.endDate, calendarDateFormat)}` : null,
  ].filter(Boolean);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ShadowBoxView style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.icon}>{categoryIcon}</View>
          <View style={styles.headerText}>
            <Label numberOfLines={1} style={styles.name}>
              {payment.name}
            </Label>
            <Label style={styles.category}>{payment.categoryName}</Label>
          </View>
          <Label style={[styles.amount, isVariable && styles.amountVariable]}>
            {isVariable
              ? "Variable"
              : `${formatDecimalDigits(payment.amount!, delimiter, decimal)} ${currency}`}
          </Label>
        </View>
        {payment.description ? <Label style={styles.description}>{payment.description}</Label> : null}
      </ShadowBoxView>

      <Label style={styles.sectionHeader}>Next due</Label>
      <ShadowBoxView style={styles.section}>
        {nextPending ? (
          <View style={styles.nextRow}>
            <View style={styles.nextText}>
              <Label style={styles.nextDate}>
                {getFormattedDate(nextPending.dueDate, dueDateFormat)}
              </Label>
              <Label style={styles.nextSub}>{daysUntil(nextPending.dueDate)}</Label>
            </View>
            <Label style={styles.nextAmount}>
              {nextPending.expectedAmount == null
                ? "Variable"
                : `${formatDecimalDigits(nextPending.expectedAmount, delimiter, decimal)} ${currency}`}
            </Label>
          </View>
        ) : (
          <Label style={styles.mutedText}>No pending payment.</Label>
        )}
      </ShadowBoxView>

      <Label style={styles.sectionHeader}>Schedule</Label>
      <ShadowBoxView style={styles.section}>
        <View style={styles.scheduleRow}>
          <Label style={styles.meta}>Repeats</Label>
          <Label style={styles.metaValue}>{scheduleParts.join(" · ")}</Label>
        </View>
        <View style={styles.scheduleRow}>
          <Label style={styles.meta}>Starts</Label>
          <Label style={styles.metaValue}>
            {getFormattedDate(payment.firstDueDate, calendarDateFormat)}
          </Label>
        </View>
        <View style={styles.scheduleRow}>
          <Label style={styles.meta}>Notifications</Label>
          <Label style={styles.metaValue}>
            {[
              payment.notifyDaysBefore
                ? `${payment.notifyDaysBefore}d before`
                : null,
              payment.notifyOnDueDay ? "on due day" : null,
              payment.notifyOnMissed ? "on missed" : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Off"}
          </Label>
        </View>
      </ShadowBoxView>

      <Label style={styles.sectionHeader}>History</Label>
      {historyRows.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialIcons name='history' size={28} color={themeColors.muted} />
          <Label style={styles.emptyTitle}>No history yet</Label>
          <Label style={styles.emptySubtitle}>
            Paid, missed, and canceled instances will appear here.
          </Label>
        </View>
      ) : (
        <ShadowBoxView style={styles.historyCard}>
          {historyRows.map((row, index) => (
            <HistoryRow
              key={row.id ?? `${row.dueDate}-${index}`}
              row={row}
              currency={currency}
              decimal={decimal}
              delimiter={delimiter}
              isLast={index === historyRows.length - 1}
            />
          ))}
        </ShadowBoxView>
      )}

      <AppActivityIndicator hideScreen isLoading={isDeleting || instancesLoading} />
    </ScrollView>
  );
};

export default UpcomingPaymentDetails;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
      gap: 8,
      paddingBottom: 40,
    },
    headerActions: {
      flexDirection: "row",
    },
    headerCard: {
      padding: 14,
      gap: 6,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    icon: {
      width: 44,
      alignItems: "center",
    },
    headerText: {
      flex: 1,
    },
    name: {
      fontSize: 18,
      fontWeight: "bold",
    },
    category: {
      fontSize: 13,
      color: theme.colors.muted,
      marginTop: 2,
    },
    amount: {
      fontSize: 16,
      fontWeight: "bold",
    },
    amountVariable: {
      color: theme.colors.muted,
      fontStyle: "italic",
    },
    description: {
      fontSize: 13,
      color: theme.colors.muted,
      marginTop: 4,
    },
    sectionHeader: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.muted,
      marginTop: 16,
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    section: {
      padding: 14,
      gap: 8,
    },
    nextRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    nextText: {
      flex: 1,
    },
    nextDate: {
      fontSize: 16,
      fontWeight: "600",
    },
    nextSub: {
      fontSize: 13,
      color: theme.colors.muted,
      marginTop: 2,
    },
    nextAmount: {
      fontSize: 16,
      fontWeight: "bold",
    },
    mutedText: {
      color: theme.colors.muted,
      fontStyle: "italic",
    },
    scheduleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    meta: {
      fontSize: 13,
      color: theme.colors.muted,
    },
    metaValue: {
      fontSize: 13,
      fontWeight: "500",
      flexShrink: 1,
      textAlign: "right",
    },
    historyCard: {
      paddingVertical: 4,
    },
    emptyCard: {
      padding: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: theme.colors.muted,
      backgroundColor: theme.colors.cardInner,
      alignItems: "center",
      gap: 6,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: "600",
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.colors.muted,
      textAlign: "center",
    },
  });
