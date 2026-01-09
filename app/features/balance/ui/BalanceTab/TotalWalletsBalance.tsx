import { StyleSheet, View, ScrollView } from "react-native";
import React, { FC } from "react";
import ShadowBoxView from "components/ShadowBoxView";
import { useGetWalletsWithBalance } from "app/queries/wallets";
import { Wallet } from "db";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { formatDecimalDigits } from "modules/numbers";
import { useGetNumberSeparatorQuery } from "app/queries/user";

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

  const styles = useThemedStyles(themedStyles);
  const walletsTotal = formatAllWalletTotals(data);

  if (!walletsTotal.length) return null;

  return (
    <ShadowBoxView style={styles.container}>
      <Label style={styles.title}>Total balance</Label>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.row}>
          {walletsTotal.map(({ amount, currencyCode, currencySymbol }) => (
            <View style={styles.item} key={currencyCode}>
              <Label style={styles.amount}>{formatDecimalDigits(amount, delimiter, decimal)}</Label>
              {!!currencySymbol && <Label style={styles.currency}>{currencySymbol}</Label>}
            </View>
          ))}
        </View>
      </ScrollView>
    </ShadowBoxView>
  );
};

export default TotalWalletsBalance;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 16,
      paddingVertical: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      marginBottom: 8,
      fontSize: 18,
      fontWeight: "600",
      alignSelf: "baseline",
      paddingHorizontal: 16,
    },
    scrollContent: {
      paddingHorizontal: 16,
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
