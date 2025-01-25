import { StyleSheet, View, useWindowDimensions } from "react-native";
import React, { FC } from "react";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import { getCategoryIcon } from "components/CategoryIcon";
import colors from "constants/colors";
import Label from "components/Label";
import { useGetSelectedWalletQuery } from "app/queries/wallets";
import { useGetMonthlyGraphDataQuery } from "app/queries/transactions";
import { formatDecimalDigits } from "modules/numbers";
import { GetMonthlyAmountsType } from "app/services/transactionQueries";
import AppActivityIndicator from "components/AppActivityIndicator";
import { useGetCategories } from "app/queries/categories";
import { CategoriesWithType } from "db";

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
  return (
    <View style={[styles.tooltip, index === 0 && { marginLeft: 50 }]}>
      <Label>{formatDecimalDigits(value)}</Label>
    </View>
  );
};

type Props = { date: Date };

const MonthlyChart: FC<Props> = ({ date }) => {
  const { width } = useWindowDimensions();
  const { data: selectedWallet, isLoading: selectedWalletLoading } = useGetSelectedWalletQuery();
  const { data: formattedData, isLoading } = useGetMonthlyGraphDataQuery(
    selectedWallet?.walletId,
    date
  );
  const { categoriesById } = useGetCategories();

  if (!formattedData.length) {
    return null;
  }

  const highestRoundedAmount =
    Math.ceil(Math.max(...formattedData.map((item) => item.totalAmount)) / 1000) * 1000;
  const barData = formatBarData(formattedData, categoriesById);

  const formatYLabel = (label: string) => {
    const yNumber = parseFloat(label);
    return yNumber >= 1000
      ? (yNumber / 1000).toFixed(yNumber % 1000 === 0 ? 0 : 2) + "k"
      : `${yNumber}`;
  };

  return (
    <View key={selectedWallet?.walletId} style={styles.container}>
      <BarChart
        data={barData}
        yAxisThickness={0}
        adjustToWidth
        parentWidth={width - 52}
        xAxisColor={colors.grey}
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
        formatYLabel={formatYLabel}
        yAxisLabelWidth={50}
        isAnimated
        animationDuration={300}
        leftShiftForLastIndexTooltip={16}
      />
      <AppActivityIndicator isLoading={isLoading || selectedWalletLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  tooltip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 10,
    paddingHorizontal: 5,
  },
});

export default MonthlyChart;
