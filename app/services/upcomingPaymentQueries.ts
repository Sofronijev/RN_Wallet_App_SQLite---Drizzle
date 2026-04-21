import { db, NewUpcomingPayment } from "db";
import { categories, upcomingPaymentInstances, upcomingPayments } from "db/schema";
import { eq, getTableColumns, sql } from "drizzle-orm";
import { addDays, addMonths, addWeeks, addYears, startOfDay } from "date-fns";

export const addUpcomingPayment = (payment: NewUpcomingPayment) =>
  db.insert(upcomingPayments).values(payment);

export const getAllUpcomingPayments = async () => {
  const rows = await db
    .select({
      ...getTableColumns(upcomingPayments),
      iconFamily: categories.iconFamily,
      iconName: categories.iconName,
      iconColor: categories.iconColor,
      paidCount: sql<number>`COUNT(CASE WHEN ${upcomingPaymentInstances.status} = 'paid' THEN 1 END)`.mapWith(
        Number
      ),
      missedCount: sql<number>`COUNT(CASE WHEN ${upcomingPaymentInstances.status} = 'missed' THEN 1 END)`.mapWith(
        Number
      ),
    })
    .from(upcomingPayments)
    .innerJoin(categories, eq(categories.id, upcomingPayments.categoryId))
    .leftJoin(
      upcomingPaymentInstances,
      eq(upcomingPaymentInstances.upcomingPaymentId, upcomingPayments.id)
    )
    .groupBy(upcomingPayments.id);

  return rows.map((row) => ({ ...row, totalCount: computeTotalCount(row) }));
};

type TotalCountInput = {
  firstDueDate: string;
  endDate: string | null;
  recurrence: string;
  customIntervalValue: number | null;
  customIntervalUnit: "day" | "week" | "month" | null;
};

const getAdvance = (row: TotalCountInput, start: Date): ((index: number) => Date) | null => {
  switch (row.recurrence) {
    case "daily":
      return (i) => addDays(start, i);
    case "weekly":
      return (i) => addWeeks(start, i);
    case "monthly":
      return (i) => addMonths(start, i);
    case "yearly":
      return (i) => addYears(start, i);
    case "custom": {
      if (!row.customIntervalUnit) return null;
      if (!row.customIntervalValue || row.customIntervalValue <= 0) return null;
      const value = row.customIntervalValue;
      const addFn =
        row.customIntervalUnit === "day"
          ? addDays
          : row.customIntervalUnit === "week"
            ? addWeeks
            : addMonths;
      return (i) => addFn(start, i * value);
    }
    default:
      return null;
  }
};

export const MAX_OCCURRENCES = 10_000;

const computeTotalCount = (row: TotalCountInput): number | null => {
  if (!row.endDate) return null;
  const start = startOfDay(new Date(row.firstDueDate));
  const end = startOfDay(new Date(row.endDate));
  if (start > end) return 0;
  if (row.recurrence === "none") return 1;

  const advance = getAdvance(row, start);
  if (!advance) return null;

  let count = 0;
  while (advance(count) <= end) {
    count++;
    if (count >= MAX_OCCURRENCES) return MAX_OCCURRENCES;
  }
  return count;
};
