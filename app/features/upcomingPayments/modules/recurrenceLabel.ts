import { CUSTOM_INTERVAL_UNIT_VALUES, RECURRENCE_VALUES } from "db/schema";
import { CustomIntervalUnit, Recurrence } from "./types";

const RECURRENCE_LABEL_OVERRIDES: Partial<Record<Recurrence, string>> = {
  none: "One-time",
};

const UNIT_LABEL_OVERRIDES: Partial<Record<CustomIntervalUnit, string>> = {
  day: "Days",
  week: "Weeks",
  month: "Months",
};

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = RECURRENCE_VALUES.map(
  (value) => ({ value, label: RECURRENCE_LABEL_OVERRIDES[value] ?? titleCase(value) }),
);

export const UNIT_OPTIONS: { value: CustomIntervalUnit; label: string }[] =
  CUSTOM_INTERVAL_UNIT_VALUES.map((value) => ({
    value,
    label: UNIT_LABEL_OVERRIDES[value] ?? titleCase(value),
  }));

const RECURRENCE_LABELS = Object.fromEntries(
  RECURRENCE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Recurrence, string>;

export const getRecurrenceLabel = (
  recurrence: string,
  customValue: number | null,
  customUnit: CustomIntervalUnit | null,
) => {
  if (recurrence === "custom") {
    if (!customValue || !customUnit) return "Custom";
    return `Every ${customValue} ${customUnit}${customValue === 1 ? "" : "s"}`;
  }
  return RECURRENCE_LABELS[recurrence as Recurrence] ?? recurrence;
};
