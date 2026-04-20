import { StyleSheet, View } from "react-native";
import React from "react";
import Label from "components/Label";
import ButtonText from "components/ButtonText";
import ShadowBoxView from "components/ShadowBoxView";
import UpcomingPaymentRow from "./UpcomingPaymentRow";
import {
  DummyUpcomingInstanceRow,
  upcomingPaymentsDummyData,
} from "./upcomingPaymentsDummyData";

const MAX_VISIBLE_ROWS = 3;

const sortInstances = (rows: DummyUpcomingInstanceRow[]) => {
  const missed = rows
    .filter((row) => row.status === "missed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const pending = rows
    .filter((row) => row.status === "pending")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return [...missed, ...pending];
};

const UpcomingPaymentsSection: React.FC = () => {
  const visibleRows = sortInstances(upcomingPaymentsDummyData).slice(0, MAX_VISIBLE_ROWS);

  if (visibleRows.length === 0) return null;

  const onShowAll = () => {
    console.log("TODO: navigate to UpcomingPaymentsAll");
  };

  return (
    <ShadowBoxView style={styles.container}>
      <Label style={styles.title}>Upcoming payments</Label>
      {visibleRows.map((row) => (
        <UpcomingPaymentRow key={row.instanceId} row={row} />
      ))}
      <View style={styles.button}>
        <ButtonText title='Show all' onPress={onShowAll} />
      </View>
    </ShadowBoxView>
  );
};

export default UpcomingPaymentsSection;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 10,
  },
  title: {
    fontSize: 18,
    paddingBottom: 20,
    fontWeight: "500",
  },
  button: {
    paddingTop: 15,
  },
});
