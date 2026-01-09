import { StyleSheet, View } from "react-native";
import React, { FC } from "react";
import { DashboardOptions } from "app/context/DashboardOptions/dashboardSettingStorage";
import Label from "components/Label";
import AppSwitch from "components/AppSwitch";
import { useDashboardOptions } from "app/context/DashboardOptions/DashboardOptionsContext";

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
  const { options, updateOption } = useDashboardOptions();
  const handleToggle = (key: keyof DashboardOptions, isSelected: boolean) => {
    updateOption({ [key]: isSelected });
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

const styles = StyleSheet.create({
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
