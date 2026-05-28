import { StyleSheet, View } from "react-native";
import React, { useMemo } from "react";
import Label from "components/Label";
import ButtonText from "components/ButtonText";
import ShadowBoxView from "components/ShadowBoxView";
import NullScreen from "components/NullScreen";
import { useGetUpcomingInstancesForSection } from "app/queries/upcomingPayments";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { useAppNavigation } from "navigation/routes";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { formatDecimalDigits } from "modules/numbers";
import { isInstanceMissed } from "../modules/upcomingPaymentStatus";
import UpcomingPaymentRow from "./UpcomingPaymentRow";

const MAX_VISIBLE_ROWS = 3;

type ForecastLine = { currency: string; total: number };

const UpcomingPaymentsSection: React.FC = () => {
  const styles = useThemedStyles(themedStyles);
  const navigation = useAppNavigation();
  const { data: instances } = useGetUpcomingInstancesForSection();
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const visibleRows = instances.slice(0, MAX_VISIBLE_ROWS);
  const missedCount = instances.filter(isInstanceMissed).length;
  const dueCount = instances.length - missedCount;

  const forecastText = useMemo(() => {
    const totals = new Map<string, ForecastLine>();
    let variableCount = 0;
    for (const row of instances) {
      if (row.expectedAmount == null) {
        variableCount++;
        continue;
      }
      const currency = row.currencySymbol || row.currencyCode || "";
      const existing = totals.get(currency);
      if (existing) existing.total += row.expectedAmount;
      else totals.set(currency, { currency, total: row.expectedAmount });
    }
    if (totals.size === 0 && variableCount === 0) return null;
    const amountParts = Array.from(totals.values()).map((line) => {
      const amount = formatDecimalDigits(line.total, delimiter, decimal);
      return line.currency ? `${amount} ${line.currency}` : amount;
    });
    const amountText = amountParts.join(" · ");
    if (variableCount === 0) return amountText;
    const variableText = `${variableCount} variable`;
    return amountText ? `${amountText} + ${variableText}` : variableText;
  }, [instances, decimal, delimiter]);

  const onShowAll = () => {
    navigation.navigate("UpcomingPaymentsMonth");
  };

  return (
    <ShadowBoxView style={styles.container}>
      <View style={styles.titleRow}>
        <Label style={styles.title}>Upcoming payments for this month</Label>
        {forecastText ? <Label style={styles.forecast}>{`Expected: ${forecastText}`}</Label> : null}
      </View>
      {visibleRows.length === 0 ? (
        <NullScreen
          icon='celebrate'
          title="You're all caught up!"
          subtitle='No upcoming payments for this month.'
        />
      ) : (
        <>
          {visibleRows.map((row) => (
            <UpcomingPaymentRow key={row.id} row={row} />
          ))}
          <View style={styles.footer}>
            <View style={styles.summary}>
              {missedCount > 0 && (
                <Label style={styles.missed}>{missedCount} missed</Label>
              )}
              {missedCount > 0 && dueCount > 0 && <Label style={styles.dot}>·</Label>}
              {dueCount > 0 && <Label style={styles.due}>{dueCount} due</Label>}
            </View>
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
    titleRow: {
      paddingBottom: 20,
      gap: 2,
    },
    title: {
      fontSize: 18,
      fontWeight: "500",
    },
    forecast: {
      fontSize: 13,
      color: theme.colors.muted,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 15,
    },
    summary: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    missed: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.redDark,
    },
    due: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.muted,
    },
    dot: {
      fontSize: 13,
      color: theme.colors.muted,
    },
  });
