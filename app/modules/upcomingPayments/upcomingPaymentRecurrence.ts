import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import { formatIsoDate } from "modules/timeAndDate";

type RecurrenceRule = {
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
  customIntervalValue: number | null;
  customIntervalUnit: "day" | "week" | "month" | null;
  endDate: string | null;
};

const advance = (rule: RecurrenceRule, after: Date): Date | null => {
  switch (rule.recurrence) {
    case "daily":
      return addDays(after, 1);
    case "weekly":
      return addWeeks(after, 1);
    case "monthly":
      return addMonths(after, 1);
    case "yearly":
      return addYears(after, 1);
    case "custom": {
      if (!rule.customIntervalUnit) return null;
      if (!rule.customIntervalValue || rule.customIntervalValue <= 0) return null;
      const addFn =
        rule.customIntervalUnit === "day"
          ? addDays
          : rule.customIntervalUnit === "week"
            ? addWeeks
            : addMonths;
      return addFn(after, rule.customIntervalValue);
    }
    default:
      return null;
  }
};

export const getNextDueDate = (rule: RecurrenceRule, afterDate: string): string | null => {
  const next = advance(rule, new Date(afterDate));
  if (!next) return null;
  if (rule.endDate && next > new Date(rule.endDate)) return null;
  return formatIsoDate(next);
};
