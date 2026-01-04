import { StyleSheet, View, useWindowDimensions } from "react-native";
import React, { FC } from "react";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import { getCategoryIcon } from "components/CategoryIcon";
import colors from "constants/colors";
import Label from "components/Label";
import { useGetSelectedWalletQuery } from "app/queries/wallets";
import { useGetMonthlyGraphDataQuery } from "app/queries/transactions";
import { formatDecimalDigits, formatLabelNumber } from "modules/numbers";
import { GetMonthlyAmountsType } from "app/services/transactionQueries";
import AppActivityIndicator from "components/AppActivityIndicator";
import { useGetCategories } from "app/queries/categories";
import { CategoriesWithType } from "db";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import LabelInfo from "components/LabelInfo";

const formatBarData = (
  data: GetMonthlyAmountsType,
  categories: Record<number, CategoriesWithType>
): barDataItem[] => {
  return data.map((item) => {
    const { iconColor, iconFamily, iconName } = categories[item.categoryId];
    const categoryVisual = getCategoryIcon({
      color: iconColor,
      iconFamily: iconFamily,
      name: iconName,
      iconSize: 17,
    });

    return {
      value: item.totalAmount,
      labelComponent: () => <View style={{ alignItems: "center" }}>{categoryVisual}</View>,
      frontColor: iconColor,
      categoryId: item.categoryId,
    };
  });
};

const TooltipComponent: FC<{ value: number | undefined; index: number }> = ({ value, index }) => {
  if (!value) return null;
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const styles = useThemedStyles(themedStyles);

  return (
    <View style={[styles.tooltip, index === 0 && { marginLeft: 50 }]}>
      <Label>{formatDecimalDigits(value, delimiter, decimal)}</Label>
    </View>
  );
};

const getRoundedUpperBound = (values: number[]) => {
  const max = Math.max(...values);

  if (max <= 0) return 1;

  // za male brojeve < 10 — zaokruži jednostavno
  if (max < 10) {
    return Math.ceil(max);
  }

  // red veličine (10, 100, 1000, ...)
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));

  // korak za zaokruživanje:
  // 10  → 1
  // 100 → 10
  // 1000 → 100
  // 10000 → 1000
  const step = magnitude / 10;

  // zaokruži naviše na ovaj korak
  let rounded = Math.ceil(max / step) * step;

  return rounded;
};

type Props = { date: string };

const MonthlyChart: FC<Props> = ({ date }) => {
  const { width } = useWindowDimensions();
  const { data: selectedWallet, isLoading: selectedWalletLoading } = useGetSelectedWalletQuery();
  const { data: formattedData, isLoading } = useGetMonthlyGraphDataQuery(
    selectedWallet?.walletId,
    date
  );
  const { categoriesById } = useGetCategories();
  const styles = useThemedStyles(themedStyles);
  const { decimal } = useGetNumberSeparatorQuery();

  const highestRoundedAmount = formattedData.length
    ? getRoundedUpperBound(formattedData.map((item) => item.totalAmount))
    : 5;

  const barData = formatBarData(formattedData, categoriesById);

  return (
    <View key={selectedWallet?.walletId} style={styles.container}>
      <BarChart
        data={barData}
        yAxisThickness={0}
        adjustToWidth
        parentWidth={width - 52}
        xAxisColor={colors.grey}
        yAxisTextStyle={styles.text}
        height={150}
        yAxisExtraHeight={30}
        barBorderRadius={5}
        disableScroll
        renderTooltip={(item: barDataItem, index: number) => (
          <TooltipComponent value={item.value} index={index} />
        )}
        autoCenterTooltip
        maxValue={highestRoundedAmount}
        noOfSections={5}
        formatYLabel={formatLabelNumber}
        yAxisLabelWidth={50}
        isAnimated
        animationDuration={300}
        leftShiftForLastIndexTooltip={16}
      />
      {!formattedData.length && (
        <View style={styles.emptyWrapper}>
          <LabelInfo text='No data for this month' />
        </View>
      )}
      <AppActivityIndicator isLoading={isLoading || selectedWalletLoading} />
    </View>
  );
};

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      borderRadius: 10,
    },
    tooltip: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: colors.grey,
      borderRadius: 10,
      paddingHorizontal: 5,
    },
    text: {
      color: theme.colors.text,
    },
    emptyWrapper: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default MonthlyChart;
