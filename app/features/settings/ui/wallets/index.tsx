import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import AppActivityIndicator from "components/AppActivityIndicator";
import WalletSettingsItem from "./WalletSettingsItem";
import { createWalletMutation, useGetWalletsWithBalance } from "app/queries/wallets";
import Label from "components/Label";
import AlertPrompt from "components/AlertPrompt";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { SafeAreaView } from "react-native-safe-area-context";

const WalletSettings: React.FC = () => {
  const { data: wallets, isLoading: isWalletsLoading } = useGetWalletsWithBalance();
  const { createWallet, isLoading: isCreatingLoading } = createWalletMutation();
  const canDeleteWallet = wallets.length > 1;
  const styles = useThemedStyles(themeStyles);

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
      <TouchableOpacity style={styles.addNew} onPress={onAddNewPress}>
        <Label style={styles.addText}>Create new wallet</Label>
      </TouchableOpacity>
      <AppActivityIndicator isLoading={isWalletsLoading || isCreatingLoading} />
    </SafeAreaView>
  );
};

export default WalletSettings;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 16,
    },
    addNew: {
      padding: 16,
      backgroundColor: theme.colors.background,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderTopWidth: 1,
      borderColor: theme.colors.border,
    },
    addText: {
      fontSize: 16,
      color: theme.colors.primary,
      paddingRight: 10,
      fontWeight: "500",
    },
  });
