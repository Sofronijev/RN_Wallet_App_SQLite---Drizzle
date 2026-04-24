import { StyleSheet, View } from "react-native";
import React from "react";
import Label from "components/Label";
import ButtonText from "components/ButtonText";
import ShadowBoxView from "components/ShadowBoxView";
import NullScreen from "components/NullScreen";
import { useGetUpcomingInstancesForSection } from "app/queries/upcomingPayments";
import { useAppNavigation } from "navigation/routes";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { isInstanceMissed } from "../modules/upcomingPaymentStatus";
import UpcomingPaymentRow from "./UpcomingPaymentRow";

const MAX_VISIBLE_ROWS = 3;

const UpcomingPaymentsSection: React.FC = () => {
  const styles = useThemedStyles(themedStyles);
  const navigation = useAppNavigation();
  const { data: instances } = useGetUpcomingInstancesForSection();
  const visibleRows = instances.slice(0, MAX_VISIBLE_ROWS);
  const missedCount = instances.filter(isInstanceMissed).length;
  const dueCount = instances.length - missedCount;

  const onShowAll = () => {
    navigation.navigate("UpcomingPaymentsMonth");
  };

  return (
    <ShadowBoxView style={styles.container}>
      <Label style={styles.title}>Upcoming payments for this month</Label>
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
    title: {
      fontSize: 18,
      fontWeight: "500",
      paddingBottom: 20,
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
