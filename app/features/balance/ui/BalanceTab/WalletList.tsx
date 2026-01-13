import { Alert, ListRenderItem, StyleSheet, View, useWindowDimensions } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import Label from "components/Label";
import { formatDecimalDigits, roundDecimals } from "modules/numbers";
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
import { useGetNumberSeparatorQuery, useGetShowTotalAmount } from "app/queries/user";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import { changeBalanceStrings } from "constants/strings";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import TotalAmountToggle from "./TotalAmountToggle";
import { useDashboardOptions } from "app/context/DashboardOptions/DashboardOptionsContext";
import { addColorOpacity } from "modules/colorHelper";

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
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const { openSheet } = useActionSheet();
  const tStyles = useThemedStyles(themedStyles);
  const { options } = useDashboardOptions();
  const colors = useColors();

  const canTransfer = wallets.length >= 2;

  const startingIndex =
    wallets.length && selectedWalletId ? findWalletIndex(selectedWalletId, wallets) : undefined;

  const onWalletChange = (item: Wallet) => {
    setSelectedWallet(item.walletId);
  };

  const onBalancePress = (walletId: number, balance: number) => {
    openSheet({
      type: SHEETS.NUMERIC_KEYBOARD,
      props: {
        onSetAmount: (newAmount: number) => {
          if (Number(newAmount).toFixed(2) === Number(balance).toFixed(2)) return;
          changeCurrentBalance({ id: walletId, currentAmount: balance, newAmount });
        },
        title: changeBalanceStrings.title,
        subtitle: changeBalanceStrings.subtitle,
        showOperators: true,
        initialValue: roundDecimals(balance),
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

  const renderWallet: ListRenderItem<Wallet> = ({ item }) => {
    return (
      <View style={[tStyles.walletContainer, { borderColor: item.color }]}>
        <View>
          <View style={styles.row}>
            <View style={styles.walletNameContainer}>
              <View style={[styles.walletIconContainer, { backgroundColor: item.color + "15" }]}>
                <MaterialIcons name='account-balance-wallet' size={20} color={item.color} />
              </View>
              <Label style={styles.walletName}>{item.walletName}</Label>
            </View>
            {!options.showTotalBalance && <TotalAmountToggle />}
          </View>
          <Label style={styles.balanceLabel}>Current balance</Label>
          <View style={styles.balanceRow}>
            <Label style={styles.walletValue}>
              {showTotalAmount
                ? `${formatDecimalDigits(item.currentBalance, delimiter, decimal)}`
                : "*******"}
            </Label>
            {showTotalAmount && (
              <Label style={[styles.walletValue, tStyles.currencySymbol]}>{`${
                item.currencySymbol || item.currencyCode
              }`}</Label>
            )}
          </View>
        </View>
        <View style={styles.row}>
          <View style={tStyles.buttonContainer}>
            <MaterialIcons name='swap-horiz' size={18} color={colors.primary} />
            <ButtonText
              title='Transfer'
              onPress={onTransfer(item.walletId)}
              style={styles.button}
            />
          </View>
          <View style={tStyles.buttonContainer}>
            <MaterialIcons name='tune' size={18} color={colors.primary} />
            <ButtonText
              title='Adjust'
              onPress={() => onBalancePress(item.walletId, item.currentBalance)}
              style={styles.button}
            />
          </View>
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

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    walletContainer: {
      padding: 16,
      borderRadius: 20,
      backgroundColor: theme.colors.card,
      height: WALLET_HEIGHT,
      borderLeftWidth: 5,
      borderRightWidth: 5,
      justifyContent: "space-between",
    },
    buttonContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      paddingVertical: 2,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderColor: addColorOpacity(theme.colors.primary, 0.5),
      alignContent: "center",
      justifyContent: "center",
    },
    currencySymbol: {
      color: theme.colors.placeholder,
    },
  });

const styles = StyleSheet.create({
  walletCarousel: {
    paddingHorizontal: HORIZONTAL_PADDING,
    height: WALLET_HEIGHT,
  },
  walletIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  walletValue: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  walletNameContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  walletName: {
    fontSize: 18,
    fontWeight: "700",
    paddingLeft: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    paddingVertical: 3,
    paddingHorizontal: 0,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
