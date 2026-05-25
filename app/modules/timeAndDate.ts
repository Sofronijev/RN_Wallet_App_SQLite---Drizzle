import { dateAndTimeStrings } from "constants/strings";
import { format, formatISO, isToday, isYesterday, parseISO } from "date-fns";

export const dateIsoFormat = "yyyy-MM-dd";
export const dayAndMonthFormat = "dd MMM";
export const calendarDateFormat = "E, dd MMM yyyy";
export const monthYearFormat = "yyyy-MM";
export const dueDateFormat = "E, d MMM";

// Format used on the Drizzle SQLite db
export const apiIsoFormat = "yyyy-MM-dd'T'HH:mm:ssXXX";

export const getMonthAndYear = (date: Date | string) => format(new Date(date), "MMMM y");

export const getMonth = (date: Date) => format(date, "MMMM");

export const getFormattedDate = (date: Date | string | number, dateFormat = dateIsoFormat) =>
  format(new Date(date), dateFormat);

export const formatIsoDate = (date: Date | string | number) => formatISO(new Date(date));

export const formatTime = (date: Date | string | number) => format(new Date(date), "HH:mm");

export const formatDayString = (date: Date | string | number) => {
  const getDate = new Date(date);
  if (isToday(getDate)) return dateAndTimeStrings.today;
  if (isYesterday(getDate)) return dateAndTimeStrings.yesterday;
  return getFormattedDate(getDate, dayAndMonthFormat);
};

// Relative label for a date vs today ("Today", "Tomorrow", "in 5 days", "3 days ago").
export const relativeDaysLabel = (iso: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseISO(iso);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 0) return `in ${diff} days`;
  return `${Math.abs(diff)} days ago`;
};
