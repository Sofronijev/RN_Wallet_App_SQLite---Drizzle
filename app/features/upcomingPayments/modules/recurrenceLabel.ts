import { CustomIntervalUnit, Recurrence } from "./types";

export const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: "none", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

export const UNIT_OPTIONS: { value: CustomIntervalUnit; label: string }[] = [
  { value: "day", label: "Days" },
  { value: "week", label: "Weeks" },
  { value: "month", label: "Months" },
];

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
