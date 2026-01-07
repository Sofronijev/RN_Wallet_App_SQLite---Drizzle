import { formatLabelNumber } from "modules/numbers";

type HistoryChartData = {
  originalValue: number;
  date: string;
  label: string | undefined;
  labelTextStyle: {
    color: string;
    width: number;
  };
};

export const getHistoryChartData = (data: HistoryChartData[], sections: number, decimal: string) => {
  const values = data.map((d) => d.originalValue);
  const hasValues = values.length;
  const rawMin = values.length ? Math.min(...values) : 0;
  const rawMax = values.length ? Math.max(...values) : 0;
  const min = rawMin - Math.abs(rawMin) * 0.02;
  const max = Math.max(rawMax, 5);
  const base = min;
  const offsetData = data.map((d) => ({
    ...d,
    value: d.originalValue - base,
  }));
  const maxValue = max - base;
  const step = maxValue / sections;

  const yAxisLabelTexts = Array.from({ length: sections + 1 }, (_, i) =>
    hasValues ? formatLabelNumber(`${base + step * i}`, decimal) : " "
  );

  return {
    offsetData,
    maxValue,
    yAxisLabelTexts,
  };
};
