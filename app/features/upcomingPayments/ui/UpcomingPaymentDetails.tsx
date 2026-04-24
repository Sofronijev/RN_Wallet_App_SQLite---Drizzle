import React, { useEffect, useMemo } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { parseISO } from "date-fns";
import { AppStackParamList } from "navigation/routes";
import Label from "components/Label";
import ShadowBoxView from "components/ShadowBoxView";
import HeaderIcon from "components/Header/HeaderIcon";
import { getCategoryIcon } from "components/CategoryIcon";
import AppActivityIndicator from "components/AppActivityIndicator";
import CustomButton from "components/CustomButton";
import colors from "constants/colors";
import { calendarDateFormat, dueDateFormat, getFormattedDate } from "modules/timeAndDate";
import { formatDecimalDigits } from "modules/numbers";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import {
  useCancelUpcomingPaymentInstanceMutation,
  useClearStaleFlagMutation,
  useDeleteUpcomingPaymentMutation,
  useGetUpcomingPaymentById,
  useGetUpcomingPaymentInstances,
  useRestoreUpcomingPaymentInstanceMutation,
} from "app/queries/upcomingPayments";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { isInstanceMissed } from "../modules/upcomingPaymentStatus";
import HistoryRow from "./details/HistoryRow";

type Props = {
  navigation: StackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, "UpcomingPaymentDetails">;
};

const recurrenceLabel = (
  recurrence: string,
  customValue: number | null,
  customUnit: "day" | "week" | "month" | null,
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
  const { cancelInstance, isLoading: isCanceling } = useCancelUpcomingPaymentInstanceMutation(id);
  const { restoreInstance, isLoading: isRestoring } = useRestoreUpcomingPaymentInstanceMutation(id);
  const { clearStaleFlag, isLoading: isClearingStale } = useClearStaleFlagMutation();

  const nextPending = useMemo(
    () =>
      instances
        .filter((row) => row.status === "pending" && !isInstanceMissed(row))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0],
    [instances],
  );

  const historyRows = useMemo(
    () => instances.filter((row) => row.status !== "pending" || isInstanceMissed(row)),
    [instances],
  );

  const onEdit = () => navigation.navigate("UpcomingPayment", { id });

  const onPay = () => {
    if (!nextPending) return;
    console.log("TODO: open PaySheet for instance", nextPending.id);
  };

  const onPayInstance = (instanceId: number) => {
    console.log("TODO: open PaySheet for instance", instanceId);
  };

  const onCancelInstance = (instanceId: number) => {
    Alert.alert("Cancel this payment?", "It will move to history as canceled.", [
      { text: "Keep" },
      {
        text: "Cancel payment",
        style: "destructive",
        onPress: () => cancelInstance(instanceId),
      },
    ]);
  };

  const onRestoreInstance = (instanceId: number) => {
    restoreInstance(instanceId);
  };

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
      ],
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

  const header = (
    <>
      <ShadowBoxView style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.icon}>{categoryIcon}</View>
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Label numberOfLines={1} style={styles.name}>
                {payment.name}
              </Label>
              {payment.staleSince ? <Label style={styles.staleChip}>Stale</Label> : null}
            </View>
            <Label style={styles.category}>{payment.categoryName}</Label>
          </View>
          <Label style={[styles.amount, isVariable && styles.amountVariable]}>
            {isVariable
              ? "Variable"
              : `${formatDecimalDigits(payment.amount!, delimiter, decimal)} ${currency}`}
          </Label>
        </View>
        {payment.description ? (
          <Label style={styles.description}>{payment.description}</Label>
        ) : null}
      </ShadowBoxView>

      {payment.staleSince ? (
        <ShadowBoxView style={styles.staleCard}>
          <View style={styles.staleTitleRow}>
            <MaterialCommunityIcons
              name='alert-circle-outline'
              size={20}
              color={themeColors.redDark}
            />
            <Label style={styles.staleTitle}>Still using this?</Label>
          </View>
          <Label style={styles.staleSubtitle}>
            We stopped generating new instances because this payment fell far behind. Confirm
            you're still using it or archive it.
          </Label>
          <View style={styles.actionRow}>
            <CustomButton
              title='Still using it'
              size='small'
              style={styles.actionButton}
              onPress={() => clearStaleFlag(id)}
            />
            <CustomButton
              title='Archive'
              size='small'
              type='danger'
              outline
              style={styles.actionButton}
              onPress={onDelete}
            />
          </View>
        </ShadowBoxView>
      ) : null}

      <Label style={styles.sectionHeader}>Next due</Label>
      <ShadowBoxView style={styles.section}>
        {nextPending ? (
          <>
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
            <View style={styles.actionRow}>
              <CustomButton
                title={nextPending.expectedAmount == null ? "Enter & Pay" : "Pay"}
                size='small'
                style={styles.actionButton}
                onPress={onPay}
              />
              <CustomButton
                title='Cancel'
                size='small'
                type='danger'
                outline
                style={styles.actionButton}
                onPress={() => onCancelInstance(nextPending.id)}
              />
            </View>
          </>
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
              payment.notifyDaysBefore ? `${payment.notifyDaysBefore}d before` : null,
              payment.notifyOnDueDay ? "on due day" : null,
              payment.notifyOnMissed ? "on missed" : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Off"}
          </Label>
        </View>
      </ShadowBoxView>

      <Label style={styles.sectionHeader}>History</Label>
    </>
  );

  const empty = (
    <View style={styles.emptyCard}>
      <MaterialIcons name='history' size={28} color={themeColors.muted} />
      <Label style={styles.emptyTitle}>No history yet</Label>
      <Label style={styles.emptySubtitle}>
        Paid, missed, and canceled instances will appear here.
      </Label>
    </View>
  );

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={historyRows}
        keyExtractor={(row, index) => (row.id ?? `${row.dueDate}-${index}`).toString()}
        renderItem={({ item }) => (
          <ShadowBoxView>
            <HistoryRow
              row={item}
              isMissed={isInstanceMissed(item)}
              currency={currency}
              decimal={decimal}
              delimiter={delimiter}
              isLast
              onPay={onPayInstance}
              onCancel={onCancelInstance}
              onRestore={onRestoreInstance}
            />
          </ShadowBoxView>
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
      />
      <AppActivityIndicator
        hideScreen
        isLoading={isDeleting || isCanceling || isRestoring || isClearingStale || instancesLoading}
      />
    </>
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
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    name: {
      fontSize: 18,
      fontWeight: "bold",
      flexShrink: 1,
    },
    staleChip: {
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
    staleCard: {
      marginTop: 12,
      padding: 14,
      gap: 8,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.redDark,
    },
    staleTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    staleTitle: {
      fontSize: 15,
      fontWeight: "600",
    },
    staleSubtitle: {
      fontSize: 13,
      color: theme.colors.muted,
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
    actionRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 12,
    },
    actionButton: {
      flex: 1,
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
