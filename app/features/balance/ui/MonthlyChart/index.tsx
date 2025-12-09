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
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

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
  // uzmi najveći broj iz niza
  const max = Math.max(...values);
  // fallback ako su sve vrednosti <= 0
  if (max <= 0) return 1;
  // za male vrednosti (<10) ostavi isti broj
  if (max < 10) return max;
  // odredi red veličine (1, 10, 100, 1000, ...)
  const mag = Math.pow(10, Math.floor(Math.log10(max)));
  // odredi korak zaokruživanja u zavisnosti od magnitude
  // velika vrednost → korak 100, srednja → 10, mala → 1
  const step = mag >= 1000 ? 100 : mag >= 100 ? 10 : 1;
  // zaokruži maxValue na najbliži veći korak
  return Math.ceil(max / step) * step;
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
  const styles = useThemedStyles(themedStyles);
  const { decimal } = useGetNumberSeparatorQuery();

  if (!formattedData.length) {
    return null;
  }

  const highestRoundedAmount = getRoundedUpperBound(formattedData.map((item) => item.totalAmount));

  const barData = formatBarData(formattedData, categoriesById);

  const formatYLabel = (label: string) => {
    const yNumber = parseFloat(label);
    const million = 1_000_000;
    const thousand = 1000;
    const toDecimal = (num: number, letter: string) => (yNumber / num).toFixed(2) + letter;
    let formatted;

    if (yNumber >= million) {
      formatted = toDecimal(million, "m");
    } else if (yNumber >= thousand) {
      formatted = toDecimal(thousand, "k");
    } else if (yNumber === 0) {
      formatted = "";
    } else {
      formatted = `${yNumber}`;
    }

    formatted = formatted
      .replace(/\.?0+([km])$/, "$1") // Remove trailing zeros after the decimal point
      .replace(/\./g, decimal) // Replace all decimal points with commas
      .replace(/(\d),0(\d[km])/, "$1,$2"); // Handle the formatting like "1,20k" to "1,2k"

    return formatted;
  };

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
  });

export default MonthlyChart;
