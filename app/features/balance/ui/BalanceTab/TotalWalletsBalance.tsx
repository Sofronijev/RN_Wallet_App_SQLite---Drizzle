import { StyleSheet, View, ScrollView } from "react-native";
import React, { FC } from "react";
import ShadowBoxView from "components/ShadowBoxView";
import { useGetWalletsWithBalance } from "app/queries/wallets";
import { Wallet } from "db";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { formatDecimalDigits } from "modules/numbers";
import { useGetNumberSeparatorQuery, useGetShowTotalAmount } from "app/queries/user";
import TotalAmountToggle from "./TotalAmountToggle";

export const formatAllWalletTotals = (wallets: Wallet[]) => {
  const grouped = new Map<
    string,
    {
      amount: number;
      currencyCode: string;
      currencySymbol: string;
    }
  >();

  wallets.forEach((wallet) => {
    const key = wallet.currencyCode || "NO_CURRENCY"; // za opciju ako nije izabrana valuta

    if (!key) return;

    const prev = grouped.get(key);

    if (prev) {
      prev.amount += wallet.currentBalance;
    } else {
      grouped.set(key, {
        amount: wallet.currentBalance,
        currencyCode: wallet.currencyCode ?? "",
        currencySymbol: wallet.currencySymbol ?? "",
      });
    }
  });

  return Array.from(grouped.values());
};

const TotalWalletsBalance: FC = () => {
  const { data } = useGetWalletsWithBalance();
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const { showTotalAmount } = useGetShowTotalAmount();

  const styles = useThemedStyles(themedStyles);
  const walletsTotal = formatAllWalletTotals(data);

  if (!walletsTotal.length) return null;

  return (
    <ShadowBoxView style={styles.container}>
      <View style={styles.titleContainer}>
        <Label style={[styles.title, !showTotalAmount && styles.mutedTitle]}>
          {showTotalAmount ? "Total balance" : "Show total balance"}
        </Label>
        <TotalAmountToggle />
      </View>

      {showTotalAmount && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.row}>
            {walletsTotal.map(({ amount, currencyCode, currencySymbol }) => (
              <View style={styles.item} key={currencyCode}>
                <Label style={styles.amount}>
                  {formatDecimalDigits(amount, delimiter, decimal)}
                </Label>
                {!!currencySymbol && <Label style={styles.currency}>{currencySymbol}</Label>}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ShadowBoxView>
  );
};

export default TotalWalletsBalance;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 16,
      paddingVertical: 12,
    },
    titleContainer: {
      paddingHorizontal: 16,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    mutedTitle: {
      color: theme.colors.muted,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      alignSelf: "baseline",
    },
    scrollContent: {
      paddingHorizontal: 16,
      marginTop: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: theme.colors.cardInner,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 15,
    },
    currency: {
      fontSize: 14,
      color: theme.colors.muted,
    },
    amount: {
      fontSize: 18,
      color: theme.colors.text,
      fontWeight: "500",
    },
  });
