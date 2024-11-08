import { ListRenderItem, StyleSheet, View, useWindowDimensions } from "react-native";
import React from "react";
import Label from "components/Label";
import { formatDecimalDigits } from "modules/numbers";
import colors from "constants/colors";

import AppActivityIndicator from "components/AppActivityIndicator";

import Carousel from "components/Carousel";
import ButtonText from "components/ButtonText";
import { showBalancePrompt } from "app/features/settings/modules";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { getAllWalletsWithBalance } from "../../../../services/walletQueries";
import { setSelectedWallet } from "app/services/userQueries";
import { Wallet } from "db";

const WALLET_SPACING = 8;
const HORIZONTAL_PADDING = 16;

const walletKeyExtractor = (item: unknown) => `${item.walletId}`;

const WalletList: React.FC = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const onWalletChange = async (item: Wallet) => {
    await setSelectedWallet(item.walletId);
  };
  const { data: wallets } = useLiveQuery(getAllWalletsWithBalance());

  const onBalancePress = (walletId: number) => {
    showBalancePrompt((value: string) => {});
  };

  const walletWidth = width - HORIZONTAL_PADDING * 2;

  const renderWallet: ListRenderItem = ({ item }) => {
    return (
      <View style={[styles.walletContainer, { borderColor: item.color }]}>
        <Label style={styles.walletName}>{item.walletName}</Label>
        <Label style={styles.balanceText}>Available balance</Label>
        <Label style={styles.walletValue}>{formatDecimalDigits(item.currentBalance)}</Label>
        <View style={styles.row}>
          <ButtonText
            title='Transfer funds'
            onPress={() => navigation.navigate("TransferForm", { walletId: item.walletId })}
            style={styles.button}
          />
          <ButtonText
            title='Adjust balance'
            onPress={() => onBalancePress(item.walletId)}
            style={styles.button}
          />
        </View>
      </View>
    );
  };

  return (
    <>
      {!wallets.length ? (
        <View style={[styles.nullWallet, { width: walletWidth }]}></View>
      ) : (
        <Carousel
          data={wallets}
          renderItem={renderWallet}
          keyExtractor={walletKeyExtractor}
          itemWidth={walletWidth}
          itemSpacing={WALLET_SPACING}
          style={styles.walletCarousel}
          onSnapToItem={onWalletChange}
        />
      )}
      <AppActivityIndicator isLoading={false} />
    </>
  );
};

export default WalletList;

const walletStyle = {
  marginVertical: 20,
  padding: 10,
  borderRadius: 20,
  backgroundColor: colors.white,
  height: 170,
};

const styles = StyleSheet.create({
  walletCarousel: {
    paddingHorizontal: HORIZONTAL_PADDING,
    height: walletStyle.height + 40,
  },
  walletContainer: {
    ...walletStyle,
    borderLeftWidth: 5,
    borderRightWidth: 5,
  },
  nullWallet: {
    ...walletStyle,
    marginHorizontal: HORIZONTAL_PADDING,
  },
  balanceText: {
    textAlign: "center",
    color: colors.grey2,
  },
  walletValue: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 10,
  },
  walletName: {
    fontSize: 23,
    fontWeight: "bold",
    paddingBottom: 20,
    paddingLeft: 10,
  },
  transactionContainer: {
    marginHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
});
