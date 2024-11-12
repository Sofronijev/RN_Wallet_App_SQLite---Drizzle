import { FlatList } from "react-native";
import React from "react";
import AppActivityIndicator from "components/AppActivityIndicator";
import WalletSettingsItem from "./WalletSettingsItem";
import useGetWalletsWithBalance from "app/features/balance/hooks/useGetWalletsWithBalance";

const WalletSettings: React.FC = () => {
  const wallets = useGetWalletsWithBalance();

  return (
    <>
      <FlatList data={wallets} renderItem={({ item }) => <WalletSettingsItem wallet={item} />} />
      <AppActivityIndicator isLoading={false} />
    </>
  );
};

export default WalletSettings;
