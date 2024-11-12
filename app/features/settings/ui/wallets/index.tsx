import { FlatList, View, StyleSheet } from "react-native";
import React from "react";
import AppActivityIndicator from "components/AppActivityIndicator";
import WalletSettingsItem from "./WalletSettingsItem";
import useGetWalletsWithBalance from "app/features/balance/hooks/useGetWalletsWithBalance";
import colors from "constants/colors";

const WalletSettings: React.FC = () => {
  const wallets = useGetWalletsWithBalance();

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
    backgroundColor: colors.white,
    flex: 1,
  },
});
