import { FlatList, View, StyleSheet } from "react-native";
import React from "react";
import AppActivityIndicator from "components/AppActivityIndicator";
import WalletSettingsItem from "./WalletSettingsItem";
import { useGetWalletsWithBalance } from "app/queries/wallets";

const WalletSettings: React.FC = () => {
  const { data: wallets } = useGetWalletsWithBalance();

  return (
    <View style={styles.container}>
      <FlatList data={wallets} renderItem={({ item }) => <WalletSettingsItem wallet={item} />} />
      <AppActivityIndicator isLoading={false} />
    </View>
  );
};

export default WalletSettings;

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    flex: 1,
  },
});
