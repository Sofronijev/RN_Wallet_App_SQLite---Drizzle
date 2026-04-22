import { startOfDay } from "date-fns";
import { formatIsoDate } from "modules/timeAndDate";

export const getTodayIsoThreshold = () => formatIsoDate(startOfDay(new Date()));

type MissedInput = {
  status: string;
  dueDate: string;
};

export const isInstanceMissed = ({ status, dueDate }: MissedInput) =>
  status === "pending" && dueDate < getTodayIsoThreshold();
