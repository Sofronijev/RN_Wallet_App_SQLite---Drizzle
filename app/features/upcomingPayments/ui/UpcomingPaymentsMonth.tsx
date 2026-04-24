import React from "react";
import { FlatList, StyleSheet } from "react-native";
import NullScreen from "components/NullScreen";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { useGetUpcomingInstancesForSection } from "app/queries/upcomingPayments";
import UpcomingPaymentRow from "./UpcomingPaymentRow";

const UpcomingPaymentsMonth: React.FC = () => {
  const styles = useThemedStyles(themedStyles);
  const { data: rows } = useGetUpcomingInstancesForSection();

  if (rows.length === 0) {
    return (
      <NullScreen
        icon='celebrate'
        title="You're all caught up!"
        subtitle='No upcoming payments for this month.'
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={rows}
      keyExtractor={(row) => row.id.toString()}
      renderItem={({ item }) => <UpcomingPaymentRow row={item} />}
    />
  );
};

export default UpcomingPaymentsMonth;

const themedStyles = (theme: AppTheme) =>
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
  });
