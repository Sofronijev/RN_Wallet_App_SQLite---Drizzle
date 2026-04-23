import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Label from "components/Label";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { useGetUpcomingInstancesForSection } from "app/queries/upcomingPayments";
import UpcomingPaymentRow from "./UpcomingPaymentRow";

const UpcomingPaymentsMonth: React.FC = () => {
  const styles = useThemedStyles(themedStyles);
  const themeColors = useColors();
  const { data: rows } = useGetUpcomingInstancesForSection();

  if (rows.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name='party-popper' size={48} color={themeColors.primary} />
        <Label style={styles.emptyTitle}>You're all caught up!</Label>
        <Label style={styles.emptySubtitle}>No upcoming payments for this month.</Label>
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
    item: {
      borderWidth: 1,
      borderColor: theme.colors.muted,
      borderRadius: 10,
      backgroundColor: theme.colors.card,
      paddingHorizontal: 4,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 8,
      backgroundColor: theme.colors.background,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.muted,
      textAlign: "center",
    },
  });
