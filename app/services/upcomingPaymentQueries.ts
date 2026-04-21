import { db, NewUpcomingPayment } from "db";
import { upcomingPayments } from "db/schema";

export const addUpcomingPayment = (payment: NewUpcomingPayment) =>
  db.insert(upcomingPayments).values(payment);
