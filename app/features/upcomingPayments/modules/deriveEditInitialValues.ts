import { CategoriesWithType } from "db";
import { formatIsoDate } from "modules/timeAndDate";
import { UpcomingPaymentDetailRow } from "app/queries/upcomingPayments";
import { UpcomingPaymentFormInputs } from "./upcomingPaymentFormValidation";
import { CustomIntervalUnit, Recurrence } from "./types";

export const deriveEditInitialValues = (
  payment: UpcomingPaymentDetailRow,
  categoriesById: Record<number, CategoriesWithType>
): UpcomingPaymentFormInputs => {
  const category = categoriesById[payment.categoryId] ?? null;
  const type = category?.types.find((t) => t.id === payment.typeId) ?? null;

  return {
    date: formatIsoDate(new Date(payment.firstDueDate)),
    amount: payment.amount ?? 0,
    description: payment.description ?? "",
    category,
    type,
    currencyCode: payment.currencyCode,
    currencySymbol: payment.currencySymbol,
    name: payment.name,
    recurrence: payment.recurrence as Recurrence,
    customIntervalValue: payment.customIntervalValue,
    customIntervalUnit: payment.customIntervalUnit as CustomIntervalUnit | null,
    endDate: payment.endDate,
    isVariableAmount: payment.amount == null,
    notifyDaysBefore: payment.notifyDaysBefore,
    notifyOnDueDay: payment.notifyOnDueDay,
    notifyOnMissed: payment.notifyOnMissed,
  };
};
