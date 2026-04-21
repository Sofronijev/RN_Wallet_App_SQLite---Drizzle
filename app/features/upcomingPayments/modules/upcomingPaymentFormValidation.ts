import * as Yup from "yup";
import { Category, Type } from "db";
import { CustomIntervalUnit, Recurrence } from "./types";

export type UpcomingPaymentFormInputs = {
  date: string;
  amount: number;
  description: string;
  category: Category | null;
  type: Type | null;
  walletId: string;
  name: string;
  recurrence: Recurrence;
  customIntervalValue: number | null;
  customIntervalUnit: CustomIntervalUnit | null;
  endDate: string | null;
  isVariableAmount: boolean;
  notifyDaysBefore: number | null;
  notifyOnDueDay: boolean;
  notifyOnMissed: boolean;
};

export const upcomingPaymentValidationSchema = Yup.object({
  date: Yup.string().required().label("Date"),
  amount: Yup.number()
    .typeError("Please enter a valid number for the amount")
    .when("isVariableAmount", {
      is: true,
      then: (schema) => schema.nullable().notRequired(),
      otherwise: (schema) =>
        schema
          .required("Please enter the payment amount")
          .moreThan(0, "Amount must be greater than 0"),
    })
    .label("Amount"),
  category: Yup.object().required("Please choose a category").nullable().label("Category"),
  type: Yup.object()
    .nullable()
    .when("category", (category, schema) => {
      if (category?.id === 12) {
        return schema.required("Balance correction requires selecting an option.");
      }
      return schema.notRequired();
    })
    .label("Type"),
  walletId: Yup.number().required().nullable().label("Wallet"),
  name: Yup.string().trim().required("Please enter a name").max(255),
  recurrence: Yup.string()
    .oneOf(["none", "daily", "weekly", "monthly", "yearly", "custom"])
    .required(),
  customIntervalValue: Yup.number()
    .nullable()
    .when("recurrence", {
      is: "custom",
      then: (schema) =>
        schema
          .typeError("Enter a number")
          .required("Enter the interval")
          .integer()
          .moreThan(0, "Interval must be greater than 0"),
      otherwise: (schema) => schema.notRequired(),
    }),
  customIntervalUnit: Yup.string()
    .nullable()
    .when("recurrence", {
      is: "custom",
      then: (schema) =>
        schema.oneOf(["day", "week", "month"]).required("Pick an interval unit"),
      otherwise: (schema) => schema.notRequired(),
    }),
  endDate: Yup.string()
    .nullable()
    .when(["recurrence", "date"], {
      is: (recurrence: Recurrence) => recurrence !== "none",
      then: (schema) =>
        schema.test("after-start", "End date must be after the first due date", function (value) {
          if (!value) return true;
          const { date } = this.parent as { date: string };
          return new Date(value).getTime() > new Date(date).getTime();
        }),
      otherwise: (schema) => schema.notRequired(),
    }),
  isVariableAmount: Yup.boolean(),
  notifyDaysBefore: Yup.number().nullable(),
  notifyOnDueDay: Yup.boolean(),
  notifyOnMissed: Yup.boolean(),
});
