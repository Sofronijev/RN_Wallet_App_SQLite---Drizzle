import { FlatList, ListRenderItem, StyleSheet, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "components/CustomButton";
import { useAppNavigation } from "navigation/routes";
import { UpcomingPaymentRow, useGetUpcomingPayments } from "app/queries/upcomingPayments";
import UpcomingPaymentCard from "./UpcomingPaymentCard";

const keyExtractor = (item: UpcomingPaymentRow) => `${item.id}`;

const UpcomingPaymentsSettings: React.FC = () => {
  const navigation = useAppNavigation();
  const { data } = useGetUpcomingPayments();

  const renderItem: ListRenderItem<UpcomingPaymentRow> = ({ item }) => (
    <UpcomingPaymentCard row={item} />
  );

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.container}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.addButton}>
        <CustomButton
          onPress={() => navigation.navigate("UpcomingPayment")}
          title='New Upcoming Payment'
        />
      </View>
    </SafeAreaView>
  );
};

export default UpcomingPaymentsSettings;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  addButton: {
    padding: 16,
  },
});
