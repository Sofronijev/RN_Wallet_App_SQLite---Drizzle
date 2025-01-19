import { FlatList, View, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import AppActivityIndicator from "components/AppActivityIndicator";
import WalletSettingsItem from "./WalletSettingsItem";
import { createWalletMutation, useGetWalletsWithBalance } from "app/queries/wallets";
import Label from "components/Label";
import colors from "constants/colors";
import AlertPrompt from "components/AlertPrompt";

const WalletSettings: React.FC = () => {
  const { data: wallets, isLoading: isWalletsLoading } = useGetWalletsWithBalance();
  const { createWallet, isLoading: isCreatingLoading } = createWalletMutation();

  const onAddNewPress = () => {
    AlertPrompt.prompt("Give your new wallet a name", null, (walletName) => {
      createWallet({ walletName });
    });
  };

  return (
    <View style={styles.container}>
      <FlatList data={wallets} renderItem={({ item }) => <WalletSettingsItem wallet={item} />} />
      <TouchableOpacity style={styles.addNew} onPress={onAddNewPress}>
        <Label style={styles.addText}>Create new wallet</Label>
      </TouchableOpacity>
      <AppActivityIndicator isLoading={isWalletsLoading || isCreatingLoading} />
    </View>
  );
};

export default WalletSettings;

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    flex: 1,
  },
  addNew: {
    padding: 16,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderColor: colors.grey,
  },
  addText: {
    fontSize: 16,
    color: colors.greenMint,
    paddingRight: 10,
    fontWeight: "500",
  },
});
