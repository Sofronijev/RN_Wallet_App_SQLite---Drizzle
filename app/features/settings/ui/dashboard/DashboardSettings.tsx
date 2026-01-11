import { StyleSheet, View } from "react-native";
import React, { FC } from "react";
import { DashboardOptions } from "app/context/DashboardOptions/dashboardSettingStorage";
import Label from "components/Label";
import AppSwitch from "components/AppSwitch";
import { useDashboardOptions } from "app/context/DashboardOptions/DashboardOptionsContext";
import ShadowBoxView from "components/ShadowBoxView";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

const dashboardItems: {
  title: string;
  description: string;
  key: keyof DashboardOptions;
}[] = [
  {
    title: "Total balance",
    description: "Shows your current overall balance across all wallets.",
    key: "showTotalBalance",
  },
  {
    title: "Monthly summary",
    description: "An overview of your income and expenses for the current month.",
    key: "showMonthlySummary",
  },
  {
    title: "Balance trend",
    description: "Visualizes how your balance changes over time.",
    key: "showBalanceTrend",
  },
  {
    title: "Recent transactions",
    description: "Displays your latest transactions at a glance.",
    key: "showRecentTransactions",
  },
];

const DashboardSettings: FC = () => {
  const { options, updateOption } = useDashboardOptions();
  const styles = useThemedStyles(themedStyles);
  const handleToggle = (key: keyof DashboardOptions, isSelected: boolean) => {
    updateOption({ [key]: isSelected });
  };
  return (
    <View style={styles.container}>
      {dashboardItems.map((item) => (
        <ShadowBoxView key={item.key} style={styles.itemContainer}>
          <View style={styles.textContainer}>
            <Label style={styles.text}>{item.title}</Label>
            <Label style={styles.description}>{item.description}</Label>
          </View>
          <AppSwitch
            value={options[item.key]}
            onValueChange={(isSelected) => handleToggle(item.key, isSelected)}
          />
        </ShadowBoxView>
      ))}
    </View>
  );
};

export default DashboardSettings;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { padding: 16 },
    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
      paddingHorizontal: 16,
    },
    textContainer: {
      flex: 1,
      paddingVertical: 8,
    },
    text: {
      fontSize: 16,
      marginBottom: 4,
      fontWeight: "500",
    },
    description: {
      color: theme.colors.muted,
    },
  });
