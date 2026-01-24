import { FlatList, StyleSheet, View } from "react-native";
import React from "react";
import AppActivityIndicator from "components/AppActivityIndicator";
import WalletSettingsItem from "./WalletSettingsItem";
import { createWalletMutation, useGetWalletsWithBalance } from "app/queries/wallets";
import AlertPrompt from "components/AlertPrompt";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "components/CustomButton";

const WalletSettings: React.FC = () => {
  const { data: wallets, isLoading: isWalletsLoading } = useGetWalletsWithBalance();
  const { createWallet, isLoading: isCreatingLoading } = createWalletMutation();
  const canDeleteWallet = wallets.length > 1;

  const onAddNewPress = () => {
    AlertPrompt.prompt("Give your wallet a name", null, (walletName) => {
      createWallet({ walletName });
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={wallets}
        renderItem={({ item }) => (
          <WalletSettingsItem wallet={item} canDeleteWallet={canDeleteWallet} />
        )}
        contentContainerStyle={{ gap: 8 }}
      />
      <View style={styles.addButton}>
        <CustomButton onPress={onAddNewPress} title='New wallet'></CustomButton>
      </View>
      <AppActivityIndicator isLoading={isWalletsLoading || isCreatingLoading} />
    </SafeAreaView>
  );
};

export default WalletSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  addButton: {
    padding: 16,
  },
});
