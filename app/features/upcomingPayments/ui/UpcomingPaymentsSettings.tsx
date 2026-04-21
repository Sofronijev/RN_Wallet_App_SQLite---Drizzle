import { FlatList, StyleSheet, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "components/CustomButton";
import { useAppNavigation } from "navigation/routes";

const UpcomingPaymentsSettings: React.FC = () => {
  const navigation = useAppNavigation();

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.container}
        data={[]}
        renderItem={null}
        keyExtractor={(_, index) => `${index}`}
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
