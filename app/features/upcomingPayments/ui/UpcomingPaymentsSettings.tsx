import { FlatList, ListRenderItem, Pressable, StyleSheet, View } from "react-native";
import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "components/CustomButton";
import TwoOptionSelector from "components/TwoOptionsSelector";
import { useAppNavigation } from "navigation/routes";
import { pressableOpacityStyle } from "modules/pressable";
import { UpcomingPaymentRow, useGetUpcomingPayments } from "app/queries/upcomingPayments";
import { useThemedStyles } from "app/theme/useThemedStyles";
import UpcomingPaymentCard from "./UpcomingPaymentCard";

type Tab = "active" | "archived";

const TAB_OPTIONS = {
  active: { value: "active" as Tab, label: "Active" },
  archived: { value: "archived" as Tab, label: "Archived" },
};

const keyExtractor = (item: UpcomingPaymentRow) => `${item.id}`;

const UpcomingPaymentsSettings: React.FC = () => {
  const navigation = useAppNavigation();
  const styles = useThemedStyles(themedStyles);
  const { data } = useGetUpcomingPayments();
  const [tab, setTab] = useState<Tab>("active");

  const filtered = useMemo(
    () => data.filter((row) => (tab === "active" ? row.isActive : !row.isActive)),
    [data, tab],
  );

  const renderItem: ListRenderItem<UpcomingPaymentRow> = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate("UpcomingPaymentDetails", { id: item.id })}
      style={pressableOpacityStyle()}
    >
      <UpcomingPaymentCard row={item} />
    </Pressable>
  );

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <View style={styles.tabs}>
        <TwoOptionSelector
          left={TAB_OPTIONS.active}
          right={TAB_OPTIONS.archived}
          selected={tab}
          onChange={setTab}
        />
      </View>
      <FlatList
        contentContainerStyle={styles.container}
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
      />
      {tab === "active" ? (
        <View style={styles.addButton}>
          <CustomButton
            onPress={() => navigation.navigate("UpcomingPayment")}
            title='New Upcoming Payment'
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default UpcomingPaymentsSettings;

const themedStyles = () =>
  StyleSheet.create({
    container: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 8,
    },
    addButton: {
      padding: 16,
    },
    tabs: {
      marginHorizontal: 16,
      marginTop: 12,
    },
  });
