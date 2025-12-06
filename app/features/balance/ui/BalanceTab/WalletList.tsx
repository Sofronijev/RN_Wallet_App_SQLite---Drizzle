import { Alert, ListRenderItem, StyleSheet, View, useWindowDimensions } from "react-native";
import React from "react";
import Label from "components/Label";
import { formatDecimalDigits } from "modules/numbers";
import colors from "constants/colors";
import Carousel from "components/Carousel";
import ButtonText from "components/ButtonText";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { Wallet } from "db";
import {
  changeCurrentBalanceMutation,
  setSelectedWalletMutation,
  useGetWalletsWithBalance,
} from "app/queries/wallets";
import VisibilityToggleIcon from "components/VisibilityToggleIcon";
import {
  useGetNumberSeparatorQuery,
  useGetShowTotalAmount,
  useSetShowTotalAmount,
} from "app/queries/user";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";

const WALLET_SPACING = 8;
const HORIZONTAL_PADDING = 16;
const WALLET_HEIGHT = 170;

const walletKeyExtractor = (item: Wallet) => `${item.walletId}`;

type WalletListProps = { selectedWalletId?: number | null };

const findWalletIndex = (walletId: number, wallets: Wallet[]) => {
  const index = wallets.findIndex((wallet) => wallet.walletId === walletId);
  return index < 0 ? undefined : index;
};
const WalletList: React.FC<WalletListProps> = ({ selectedWalletId }) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const { data: wallets } = useGetWalletsWithBalance();
  const { setSelectedWallet } = setSelectedWalletMutation();
  const { changeCurrentBalance } = changeCurrentBalanceMutation();
  const { showTotalAmount } = useGetShowTotalAmount();
  const { setShowTotalAmount } = useSetShowTotalAmount();
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const { openSheet } = useActionSheet();

  const canTransfer = wallets.length >= 2;

  const totalBalance = (total: number, symbol: string | null, code: string | null) =>
    showTotalAmount
      ? `${`${formatDecimalDigits(total, delimiter, decimal)} ${symbol || code}`}`
      : "*******";

  const startingIndex =
    wallets.length && selectedWalletId ? findWalletIndex(selectedWalletId, wallets) : undefined;

  const onWalletChange = (item: Wallet) => {
    setSelectedWallet(item.walletId);
  };

  const onBalancePress = (walletId: number, balance: number) => {
    openSheet({
      type: SHEETS.NUMERIC_KEYBOARD,
      props: {
        onSetAmount: (newAmount: number) =>
          changeCurrentBalance({ id: walletId, currentAmount: balance, newAmount }),
        title: "Enter the correct balance",
        subtitle: "A correction transaction will be created to adjust it accordingly",
        showOperators: true,
      },
    });
  };

  const walletWidth = width - HORIZONTAL_PADDING * 2;

  const onTransfer = (walletId: number) => () => {
    if (canTransfer) {
      navigation.navigate("TransferForm", { walletId });
    } else {
      Alert.alert(
        "Transfer not possible",
        "To make a transfer, you need at least two wallets. Please add another wallet to continue"
      );
    }
  };

  const onIsVisiblePress = (isVisible: boolean) => {
    setShowTotalAmount(isVisible);
  };

  const renderWallet: ListRenderItem<Wallet> = ({ item }) => {
    return (
      <View style={[styles.walletContainer, { borderColor: item.color }]}>
        <View style={styles.row}>
          <Label style={styles.walletName}>{item.walletName}</Label>
          <VisibilityToggleIcon isVisible={showTotalAmount} onPress={onIsVisiblePress} />
        </View>
        <Label style={styles.walletValue}>
          {totalBalance(item.currentBalance, item.currencySymbol, item.currencyCode)}
        </Label>
        <View style={styles.row}>
          <ButtonText
            title='Transfer funds'
            onPress={onTransfer(item.walletId)}
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
        // Key is used to reset carousel when wallets change (mostly when wallet is deleted so there is no empty space)
        key={`${wallets.length}-wallets`}
        data={wallets}
        renderItem={renderWallet}
        keyExtractor={walletKeyExtractor}
        itemWidth={walletWidth}
        itemSpacing={WALLET_SPACING}
        style={styles.walletCarousel}
        onSnapToItem={onWalletChange}
        initialIndex={startingIndex}
      />
      {/* <AppActivityIndicator isLoading={true} /> */}
    </>
  );
};

export default WalletList;

const styles = StyleSheet.create({
  walletCarousel: {
    paddingHorizontal: HORIZONTAL_PADDING,
    height: WALLET_HEIGHT,
  },
  walletContainer: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    height: WALLET_HEIGHT,
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
