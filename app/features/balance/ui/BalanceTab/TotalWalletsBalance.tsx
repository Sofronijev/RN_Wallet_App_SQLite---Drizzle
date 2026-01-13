import { StyleSheet, View, ScrollView } from "react-native";
import React, { FC, useEffect } from "react";
import ShadowBoxView from "components/ShadowBoxView";
import { useGetWalletsWithBalance } from "app/queries/wallets";
import { Wallet } from "db";
import Label from "components/Label";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { formatDecimalDigits } from "modules/numbers";
import { useGetNumberSeparatorQuery, useGetShowTotalAmount } from "app/queries/user";
import TotalAmountToggle from "./TotalAmountToggle";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

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

const ANIMATION_CONFIG = {
  duration: 500,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

const TotalWalletsBalance: FC = () => {
  const { data } = useGetWalletsWithBalance();
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const { showTotalAmount } = useGetShowTotalAmount();
  const colors = useColors();

  const styles = useThemedStyles(themedStyles);
  const walletsTotal = formatAllWalletTotals(data);

  const heightValue = useSharedValue(0);
  const opacityValue = useSharedValue(0);

  useEffect(() => {
    if (showTotalAmount) {
      heightValue.value = withTiming(1, ANIMATION_CONFIG);
      opacityValue.value = withTiming(1, ANIMATION_CONFIG);
    } else {
      heightValue.value = withTiming(0, ANIMATION_CONFIG);
      opacityValue.value = withTiming(0, ANIMATION_CONFIG);
    }
  }, [showTotalAmount]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      maxHeight: heightValue.value * 100,
      opacity: opacityValue.value,
      overflow: "hidden",
    };
  });

  if (!walletsTotal.length) return null;

  return (
    <ShadowBoxView style={styles.container}>
      <View style={styles.header}>
        <Label style={[styles.title, !showTotalAmount && styles.mutedTitle]}>Total Balance</Label>
        <TotalAmountToggle />
      </View>

      <Animated.View style={animatedStyle}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.balancesRow}>
            {walletsTotal.map(({ amount, currencyCode, currencySymbol }, index) => (
              <View key={currencyCode} style={styles.balanceCard}>
                <View style={styles.cardContent}>
                  <Label style={styles.currencyCode}>{currencyCode}</Label>
                  <View style={styles.amountRow}>
                    <Label style={styles.amount}>
                      {formatDecimalDigits(amount, delimiter, decimal)}
                    </Label>
                    {!!currencySymbol && <Label style={styles.currency}>{currencySymbol}</Label>}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </ShadowBoxView>
  );
};

export default TotalWalletsBalance;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 16,
    },
    header: {
      paddingHorizontal: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    title: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.text,
    },
    mutedTitle: {
      color: theme.colors.muted,
    },
    scrollContent: {
      paddingHorizontal: 16,
      gap: 12,
      marginTop: 16,
    },
    balancesRow: {
      flexDirection: "row",
      gap: 12,
    },
    balanceCard: {
      backgroundColor: theme.colors.cardInner,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minWidth: 140,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardContent: {
      gap: 6,
    },
    currencyCode: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    amountRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 4,
    },
    amount: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    currency: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.colors.muted,
    },
  });
