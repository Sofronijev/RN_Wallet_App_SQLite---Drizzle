import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import NullScreen from "components/NullScreen";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { useGetUpcomingInstancesForSection } from "app/queries/upcomingPayments";
import NotificationPermissionBanner from "app/notifications/NotificationPermissionBanner";
import UpcomingPaymentRow from "./UpcomingPaymentRow";

const UpcomingPaymentsMonth: React.FC = () => {
  const styles = useThemedStyles(themedStyles);
  const { data: rows } = useGetUpcomingInstancesForSection();

  if (rows.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.bannerWrap}>
          <NotificationPermissionBanner />
        </View>
        <NullScreen
          icon='celebrate'
          title="You're all caught up!"
          subtitle='No upcoming payments for this month.'
        />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={rows}
      keyExtractor={(row) => row.id.toString()}
      renderItem={({ item }) => <UpcomingPaymentRow row={item} />}
      ListHeaderComponent={<NotificationPermissionBanner />}
      ListHeaderComponentStyle={styles.header}
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
    header: {
      marginBottom: 8,
    },
    bannerWrap: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
  });
