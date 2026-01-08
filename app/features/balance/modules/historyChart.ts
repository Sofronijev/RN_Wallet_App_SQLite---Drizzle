import { formatLabelNumber, getRoundedLowerBound, getRoundedUpperBound } from "modules/numbers";

type HistoryChartData = {
  originalValue: number;
  date: string;
  label: string | undefined;
  labelTextStyle: {
    color: string;
    width: number;
  };
};

export const getMixedGridLines = (min: number, max: number, totalSections = 6) => {
  // Step je uniforman: najveći apsolutni range / polovinu sekcija
  // Prvo odredi koliki deo je ispod i iznad nule proporcionalno
  const absMin = Math.abs(min);
  const totalRange = absMin + max;

  // Proporcija sekcija ispod i iznad nule
  const negativeSections = Math.max(1, Math.round((absMin / totalRange) * totalSections));
  const positiveSections = totalSections - negativeSections;

  // Uniforman step
  const step = Math.max(absMin / negativeSections, max / positiveSections);

  // Negativne linije
  const negativeLines = Array.from(
    { length: negativeSections },
    (_, i) => -step * (negativeSections - i)
  );

  // Zero
  const zeroLine = 0;

  // Pozitivne linije
  const positiveLines = Array.from({ length: positiveSections }, (_, i) => step * (i + 1));
  const labels = [...negativeLines, zeroLine, ...positiveLines];

  return {
    yAxisLabels: labels,
    minValue: labels[0],
    maxValue: labels[labels.length - 1],
    step,
  };
};

export const getHistoryChartData = (data: HistoryChartData[], decimal: string) => {
  const values = data.map((d) => d.originalValue);
  const hasValues = values.length > 0;

  const rawMin = values.length ? Math.min(...values) : 0;
  const rawMax = values.length ? Math.max(...values) : 0;

  const isNegative = rawMax <= 0 && rawMin < 0;
  const isMixed = rawMax > 0 && rawMin < 0;

  const sections = isMixed ? 6 : 5;

  let min = 0;
  let max = 0;
  let zeroRuleIndex = null;
  let base = 0;
  let maxValue = 0;
  let step = 0;

  if (isNegative) {
    zeroRuleIndex = sections - 1;
    min = getRoundedUpperBound(Math.min(rawMin, -5));
    max = 0;
    base = min;
    maxValue = max - base;
    step = maxValue / sections;
  } else if (isMixed) {
    const mixedData = getMixedGridLines(
      getRoundedUpperBound(rawMin),
      getRoundedUpperBound(rawMax),
      sections
    );
    min = mixedData.minValue;
    max = mixedData.maxValue;
    base = min;
    maxValue = max + Math.abs(min);
    step = mixedData.step;
  } else {
    min = getRoundedLowerBound(rawMin);
    max = getRoundedUpperBound(Math.max(rawMax, 5));
    base = min;
    maxValue = max - base;
    step = maxValue / sections;
  }

  const offsetData = data.map((d) => ({
    ...d,
    value: d.originalValue - base,
  }));

  const getYAxisLabelTexts = Array.from({ length: sections + 1 }, (_, i) => base + step * i);

  const yAxisLabelTexts = getYAxisLabelTexts.map((value) =>
    hasValues ? formatLabelNumber(`${value}`, decimal) : " "
  );

  const zeroIndex = isMixed ? yAxisLabelTexts.indexOf("0") - 1 : zeroRuleIndex;

  return {
    offsetData,
    maxValue,
    yAxisLabelTexts,
    sections,
    zeroRuleIndex: zeroIndex,
  };
};

export const getTotalChange = (data: HistoryChartData[]) => {
  const firstValue = data[0]?.originalValue ?? 0;
  const lastValue = data[data.length - 1]?.originalValue ?? 0;

  const changeAmount = lastValue - firstValue;
  const changePercent = firstValue !== 0 ? (changeAmount / firstValue) * 100 : null;
  return { changeAmount, changePercent };
};
