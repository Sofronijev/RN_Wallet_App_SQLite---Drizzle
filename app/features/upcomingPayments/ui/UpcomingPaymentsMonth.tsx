import React, { useEffect, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { endOfMonth, format, startOfMonth } from "date-fns";
import Label from "components/Label";
import { AppStackParamList } from "navigation/routes";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { useGetUpcomingInstancesForSection } from "app/queries/upcomingPayments";
import { isInstanceMissed } from "../modules/upcomingPaymentStatus";
import UpcomingPaymentRow from "./UpcomingPaymentRow";

type Props = {
  navigation: StackNavigationProp<AppStackParamList, "UpcomingPaymentsMonth">;
};

const UpcomingPaymentsMonth: React.FC<Props> = ({ navigation }) => {
  const styles = useThemedStyles(themedStyles);
  const themeColors = useColors();
  const { data: instances } = useGetUpcomingInstancesForSection();

  const { monthLabel, rows } = useMemo(() => {
    const now = new Date();
    const startIso = format(startOfMonth(now), "yyyy-MM-dd");
    const endIso = format(endOfMonth(now), "yyyy-MM-dd");
    const thisMonth = instances.filter((row) => row.dueDate >= startIso && row.dueDate <= endIso);
    const missed = thisMonth
      .filter((row) => isInstanceMissed(row))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const pending = thisMonth
      .filter((row) => !isInstanceMissed(row))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return {
      monthLabel: format(now, "MMMM yyyy"),
      rows: [...missed, ...pending],
    };
  }, [instances]);

  useEffect(() => {
    navigation.setOptions({ title: monthLabel });
  }, [navigation, monthLabel]);

  if (rows.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name='party-popper' size={48} color={themeColors.primary} />
        <Label style={styles.emptyTitle}>You're all caught up!</Label>
        <Label style={styles.emptySubtitle}>No payments due in {monthLabel}.</Label>
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
