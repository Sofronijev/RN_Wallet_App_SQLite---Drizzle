import { FlatList, StyleSheet } from "react-native";
import React from "react";
import AppActivityIndicator from "components/AppActivityIndicator";
import WalletSettingsItem from "./WalletSettingsItem";

const WalletSettings: React.FC = () => {
  const userId = 1;
  const wallets = [];
  const walletsArray = [];

  return (
    <>
      <FlatList
        data={walletsArray}
        renderItem={({ item }) => <WalletSettingsItem walletId={item.walletId} />}
      />
      <AppActivityIndicator isLoading={false} />
    </>
  );
};

export default WalletSettings;

const styles = StyleSheet.create({});
