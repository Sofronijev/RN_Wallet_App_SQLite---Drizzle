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
import { Wallet } from "db";
import {
  changeCurrentBalanceMutation,
  setSelectedWalletMutation,
  useGetWalletsWithBalance,
} from "app/queries/wallets";

const WALLET_SPACING = 8;
const HORIZONTAL_PADDING = 16;

// TODO - FIX THIS TYPE
const walletKeyExtractor = (item: any) => `${item.walletId}`;

type WalletListProps = { selectedWalletId?: number | null };

const WalletList: React.FC<WalletListProps> = ({ selectedWalletId }) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const { data: wallets } = useGetWalletsWithBalance();
  const { setSelectedWallet } = setSelectedWalletMutation();
  const { changeCurrentBalance } = changeCurrentBalanceMutation();

  const startingIndex =
    wallets.length && selectedWalletId
      ? wallets.findIndex((wallet) => wallet.walletId === selectedWalletId)
      : undefined;

  const onWalletChange = (item: Wallet) => {
    setSelectedWallet(item.walletId);
  };

  const onBalancePress = (walletId: number, balance: number) => {
    showBalancePrompt((newAmount: number) => {
      return changeCurrentBalance({ id: walletId, currentAmount: balance, newAmount });
    });
  };

  const walletWidth = width - HORIZONTAL_PADDING * 2;

  // TODO - FIX this
  const renderWallet: ListRenderItem<any> = ({ item }) => {
    return (
      <View style={[styles.walletContainer, { borderColor: item.color }]}>
        <Label style={styles.walletName}>{item.walletName}</Label>
        <Label style={styles.walletValue}>{`${formatDecimalDigits(item.currentBalance)} ${
          item.currencySymbol || item.currencyCode
        }`}</Label>
        <View style={styles.row}>
          <ButtonText
            title='Transfer funds'
            onPress={() => navigation.navigate("TransferForm", { walletId: item.walletId })}
            style={styles.button}
          />
          <ButtonText
            title='Adjust balance'
            onPress={() => onBalancePress(item.walletId, item.currentBalance)}
            style={styles.button}
          />
        </View>
      </View>
    );
  };

  if (!wallets.length) return null;

  return (
    <>
      <Carousel
        data={wallets}
        renderItem={renderWallet}
        keyExtractor={walletKeyExtractor}
        itemWidth={walletWidth}
        itemSpacing={WALLET_SPACING}
        style={styles.walletCarousel}
        onSnapToItem={onWalletChange}
        initialIndex={startingIndex}
      />
      {/* <AppActivityIndicator isLoading={mutation.isPending} /> */}
    </>
  );
};

export default WalletList;

const walletStyle = {
  padding: 10,
  borderRadius: 20,
  backgroundColor: colors.white,
  height: 170,
};

const styles = StyleSheet.create({
  walletCarousel: {
    paddingHorizontal: HORIZONTAL_PADDING,
    height: walletStyle.height,
  },
  walletContainer: {
    ...walletStyle,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    justifyContent: "space-between",
  },
  walletValue: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  walletName: {
    fontSize: 23,
    fontWeight: "bold",
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
