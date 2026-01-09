import { StyleSheet, Text, View } from "react-native";
import React, { FC, useState } from "react";
import {
  DashboardOptions,
  getDashboardOptions,
  setDashboardOptions,
} from "../../modules/dashboardSettingStorage";
import Label from "components/Label";
import AppSwitch from "components/AppSwitch";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

const dashboardItems: { title: string; key: keyof DashboardOptions }[] = [
  {
    title: "Total balance",
    key: "showTotalBalance",
  },
  {
    title: "Monthly summary",
    key: "showMonthlySummary",
  },
  {
    title: "Balance trend",
    key: "showBalanceTrend",
  },
  {
    title: "Recent transactions",
    key: "showRecentTransactions",
  },
];

const DashboardSettings: FC = () => {
  const [options, setOptions] = useState<DashboardOptions>(getDashboardOptions());
  const styles = useThemedStyles(themedStyles);

  const handleToggle = async (key: keyof DashboardOptions, isSelected: boolean) => {
    const updated = { ...options, [key]: isSelected };
    setOptions(updated);
    await setDashboardOptions({ [key]: isSelected });
  };
  return (
    <View style={styles.container}>
      {dashboardItems.map((item) => (
        <View key={item.key} style={styles.itemContainer}>
          <Label style={styles.text}>{item.title}</Label>
          <AppSwitch
            value={options[item.key]}
            onValueChange={(isSelected) => handleToggle(item.key, isSelected)}
          />
        </View>
      ))}
    </View>
  );
};

export default DashboardSettings;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { paddingHorizontal: 16 },
    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    text: {
      fontSize: 15,
    },
  });
