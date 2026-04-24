import { FlatList, ListRenderItem, Pressable, StyleSheet, View } from "react-native";
import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Label from "components/Label";
import CustomButton from "components/CustomButton";
import { useAppNavigation } from "navigation/routes";
import { pressableOpacityStyle } from "modules/pressable";
import { UpcomingPaymentRow, useGetUpcomingPayments } from "app/queries/upcomingPayments";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import UpcomingPaymentCard from "./UpcomingPaymentCard";

type Tab = "active" | "archived";

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
        <TabButton label='Active' selected={tab === "active"} onPress={() => setTab("active")} />
        <TabButton
          label='Archived'
          selected={tab === "archived"}
          onPress={() => setTab("archived")}
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

type TabButtonProps = { label: string; selected: boolean; onPress: () => void };

const TabButton: React.FC<TabButtonProps> = ({ label, selected, onPress }) => {
  const styles = useThemedStyles(themedStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, selected && styles.tabButtonSelected]}
    >
      <Label style={[styles.tabLabel, selected && styles.tabLabelSelected]}>{label}</Label>
    </Pressable>
  );
};

export default UpcomingPaymentsSettings;

const themedStyles = (theme: AppTheme) =>
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
      flexDirection: "row",
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.cardInner,
      padding: 4,
      gap: 4,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 6,
    },
    tabButtonSelected: {
      backgroundColor: theme.colors.card,
    },
    tabLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: theme.colors.muted,
    },
    tabLabelSelected: {
      color: theme.colors.text,
      fontWeight: "600",
    },
  });
