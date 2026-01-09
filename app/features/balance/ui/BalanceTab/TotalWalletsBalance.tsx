import { StyleSheet, View, ScrollView } from "react-native";
import React, { FC, useEffect } from "react";
import ShadowBoxView from "components/ShadowBoxView";
import { useGetWalletsWithBalance } from "app/queries/wallets";
import { Wallet } from "db";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
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
      <View style={styles.titleContainer}>
        <Label style={[styles.title, !showTotalAmount && styles.mutedTitle]}>
          {"Total balance"}
        </Label>
        <TotalAmountToggle />
      </View>

      <Animated.View style={animatedStyle}>
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
      </Animated.View>
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
