import { differenceInCalendarDays, differenceInCalendarMonths, differenceInCalendarYears, parseISO } from "date-fns";
import { CustomIntervalUnit, Recurrence } from "./types";

type TotalCountInput = {
  firstDueDate: string;
  endDate: string | null;
  recurrence: Recurrence;
  customIntervalValue: number | null;
  customIntervalUnit: CustomIntervalUnit | null;
};

export const computeTotalCount = (row: TotalCountInput): number | null => {
  if (!row.endDate) return null;
  const start = parseISO(row.firstDueDate);
  const end = parseISO(row.endDate);
  if (start > end) return 0;

  switch (row.recurrence) {
    case "none":
      return 1;
    case "daily":
      return differenceInCalendarDays(end, start) + 1;
    case "weekly":
      return Math.floor(differenceInCalendarDays(end, start) / 7) + 1;
    case "monthly":
      return differenceInCalendarMonths(end, start) + 1;
    case "yearly":
      return differenceInCalendarYears(end, start) + 1;
    case "custom": {
      const value = row.customIntervalValue;
      if (!value || value <= 0 || !row.customIntervalUnit) return null;
      const span =
        row.customIntervalUnit === "day"
          ? differenceInCalendarDays(end, start)
          : row.customIntervalUnit === "week"
            ? Math.floor(differenceInCalendarDays(end, start) / 7)
            : differenceInCalendarMonths(end, start);
      return Math.floor(span / value) + 1;
    }
    default:
      return null;
  }
};
