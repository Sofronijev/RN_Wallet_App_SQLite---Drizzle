import * as Yup from "yup";
import { Category, Type } from "db";
import { CUSTOM_INTERVAL_UNIT_VALUES, RECURRENCE_VALUES } from "db/schema";
import { CustomIntervalUnit, Recurrence } from "./types";

export type UpcomingPaymentFormInputs = {
  date: string;
  amount: number;
  description: string;
  category: Category | null;
  type: Type | null;
  currencyCode: string;
  currencySymbol: string;
  name: string;
  recurrence: Recurrence;
  customIntervalValue: number | null;
  customIntervalUnit: CustomIntervalUnit | null;
  endDate: string | null;
};

export const upcomingPaymentValidationSchema = Yup.object({
  date: Yup.string().required().label("Date"),
  amount: Yup.number()
    .typeError("Please enter a valid number for the amount")
    .min(0, "Amount cannot be negative")
    .label("Amount"),
  category: Yup.object().required("Please choose a category").nullable().label("Category"),
  type: Yup.object().nullable().notRequired().label("Type"),
  currencyCode: Yup.string().trim().label("Currency"),
  currencySymbol: Yup.string(),
  name: Yup.string().trim().required("Please enter a name").max(255),
  recurrence: Yup.string().oneOf([...RECURRENCE_VALUES]).required(),
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
        schema.oneOf([...CUSTOM_INTERVAL_UNIT_VALUES]).required("Pick an interval unit"),
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
});
