import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import ShadowBoxView from "components/ShadowBoxView";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { useGetSelectedWalletQuery, useGetWalletTotalsForChart } from "app/queries/wallets";
import { LineChart } from "react-native-gifted-charts";
import Label from "components/Label";
import { formatDecimalDigits, formatLabelNumber } from "modules/numbers";
import { format } from "date-fns";
import HistoryChartLabel from "./HistoryChartLabel";
import AppActivityIndicator from "components/AppActivityIndicator";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { getHistoryChartData } from "../../modules/historyChart";

type Props = {};

const Y_AXIS_LABEL_WIDTH = 70;

const daysOptions = [7, 30, 90];
const SECTIONS = 5;
const INITIAL_SPACING = 10;

const getDayLabel = (numOfDays: number) => {
  switch (numOfDays) {
    case 7:
      return 1;
    case 90:
      return 14;
    default:
      return 7;
  }
};

const TotalHistoryChart: React.FC<Props> = () => {
  const { data: selectedWallet, isLoading: selectedWalletLoading } = useGetSelectedWalletQuery();
  const [numOfDays, setNumOfDays] = useState(30);
  const [containerWidth, setContainerWidth] = useState(0);
  const { data, isLoading } = useGetWalletTotalsForChart(selectedWallet?.walletId, numOfDays);
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const colors = useColors();
  const styles = useThemedStyles(themedStyles);
  
  const isWeekView = numOfDays === 7;

  const chartWidth = containerWidth - Y_AXIS_LABEL_WIDTH - 16 - INITIAL_SPACING;
  const spacing = data.length ? Math.floor(chartWidth / numOfDays) : 0;

  const dayToLabel = getDayLabel(numOfDays);

  const formattedData = data.length
    ? data.map((item, index) => ({
        originalValue: item.totalBalance,
        date: item.date,
        label: index % dayToLabel === 0 ? format(new Date(item.date), "dd MMM") : undefined,
        labelTextStyle: { color: colors.muted, width: 60 },
      }))
    : [];

  const { maxValue, offsetData, yAxisLabelTexts } = useMemo(() => {
    return getHistoryChartData(formattedData, SECTIONS, decimal);
  }, [formattedData]);

  return (
    <ShadowBoxView
      style={styles.container}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      <View style={styles.titleContainer}>
        <Label style={styles.title}>Total trend</Label>
        <View style={styles.daysContainer}>
          {daysOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.daysButton, option === numOfDays && styles.selectedDay]}
              onPress={() => setNumOfDays(option)}
            >
              <Label>{`${option} days`}</Label>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <LineChart
        width={chartWidth}
        xAxisLabelsVerticalShift={!isWeekView ? -14 : undefined}
        labelsExtraHeight={35}
        data={offsetData}
        maxValue={maxValue}
        noOfSections={SECTIONS}
        initialSpacing={INITIAL_SPACING}
        endSpacing={0}
        yAxisLabelTexts={yAxisLabelTexts}
        yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
        key={formattedData.length}
        isAnimated
        // scrollToEnd
        spacing={spacing}
        areaChart
        rotateLabel
        hideDataPoints
        startFillColor={colors.primary}
        startOpacity={0.7}
        endOpacity={0.2}
        yAxisThickness={0}
        rulesType='solid'
        rulesColor={colors.border}
        thickness={3}
        yAxisTextStyle={styles.labels}
        yAxisColor={colors.placeholder}
        rulesThickness={1}
        xAxisColor={colors.placeholder}
        color={colors.primary}
        // curved
        height={200}
        showFractionalValues={false}
        xAxisLabelTextStyle={styles.labels}
        pointerConfig={{
          pointerStripColor: colors.disabled,
          pointerStripWidth: 2,
          pointerColor: colors.primary,
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: true,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: typeof offsetData) => {
            return (
              <HistoryChartLabel
                date={format(new Date(items[0].date), "dd MMM")}
                value={formatDecimalDigits(items[0].originalValue, delimiter, decimal)}
              />
            );
          },
        }}
      />
      <AppActivityIndicator isLoading={isLoading || selectedWalletLoading} />
    </ShadowBoxView>
  );
};

export default TotalHistoryChart;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingVertical: 8,
    },
    labels: {
      color: theme.colors.text,
    },
    titleContainer: {
      marginBottom: 16,
      marginLeft: 16,
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
    },
    title: {
      fontSize: 18,
      fontWeight: "500",
    },
    daysContainer: {
      flexDirection: "row",
      gap: 8,
    },
    daysButton: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    selectedDay: {
      backgroundColor: theme.colors.selected,
    },
  });
