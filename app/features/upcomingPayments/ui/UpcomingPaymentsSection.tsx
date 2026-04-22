import { StyleSheet, View } from "react-native";
import React, { useMemo } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { endOfMonth, format, startOfMonth } from "date-fns";
import Label from "components/Label";
import ButtonText from "components/ButtonText";
import ShadowBoxView from "components/ShadowBoxView";
import { useGetUpcomingInstancesForSection } from "app/queries/upcomingPayments";
import { useAppNavigation } from "navigation/routes";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import UpcomingPaymentRow from "./UpcomingPaymentRow";

const MAX_VISIBLE_ROWS = 3;

const UpcomingPaymentsSection: React.FC = () => {
  const styles = useThemedStyles(themedStyles);
  const themeColors = useColors();
  const navigation = useAppNavigation();
  const { data: instances } = useGetUpcomingInstancesForSection();

  const { monthLabel, visibleRows } = useMemo(() => {
    const now = new Date();
    const startIso = format(startOfMonth(now), "yyyy-MM-dd");
    const endIso = format(endOfMonth(now), "yyyy-MM-dd");
    const thisMonth = instances.filter(
      (row) => row.dueDate >= startIso && row.dueDate <= endIso
    );
    return {
      monthLabel: format(now, "MMMM"),
      visibleRows: thisMonth.slice(0, MAX_VISIBLE_ROWS),
    };
  }, [instances]);

  const onShowAll = () => {
    navigation.navigate("UpcomingPaymentsMonth");
  };

  return (
    <ShadowBoxView style={styles.container}>
      <View style={styles.header}>
        <Label style={styles.title}>Upcoming payments</Label>
        <View style={styles.monthBadge}>
          <Label style={styles.monthText}>{monthLabel}</Label>
        </View>
      </View>
      {visibleRows.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons
            name='party-popper'
            size={32}
            color={themeColors.primary}
          />
          <Label style={styles.emptyTitle}>You're all caught up!</Label>
          <Label style={styles.emptySubtitle}>No payments due in {monthLabel}.</Label>
        </View>
      ) : (
        <>
          {visibleRows.map((row) => (
            <UpcomingPaymentRow key={row.id} row={row} />
          ))}
          <View style={styles.button}>
            <ButtonText title='Show all' onPress={onShowAll} />
          </View>
        </>
      )}
    </ShadowBoxView>
  );
};

export default UpcomingPaymentsSection;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      borderRadius: 10,
      padding: 10,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: "500",
    },
    monthBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: theme.colors.cardInner,
    },
    monthText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    button: {
      paddingTop: 15,
    },
    emptyCard: {
      padding: 20,
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
