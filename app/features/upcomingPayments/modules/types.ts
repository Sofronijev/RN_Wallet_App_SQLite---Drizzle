import { UpcomingPayment } from "db";

export type Recurrence = UpcomingPayment["recurrence"];
export type CustomIntervalUnit = NonNullable<UpcomingPayment["customIntervalUnit"]>;
