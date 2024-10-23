import { dateAndTimeStrings } from "constants/strings";
import { addMonths, format, formatISO, isToday, isYesterday } from "date-fns";

export const dateIsoFormat = "yyyy-MM-dd";
export const dayAndMonthFormat = "dd MMM";
export const calendarDateFormat = "E, dd MMM yyyy";
export const monthYearFormat = "yyyy-MM";

export const getMonthAndYear = (date: Date) => format(date, "MMMM Y");

export const getMonth = (date: Date) => format(date, "MMMM");

export const getFormattedDate = (date: Date | string | number, dateFormat = dateIsoFormat) =>
  format(new Date(date), dateFormat);

export const formatIsoDate = (date: Date | string | number) => formatISO(new Date(date));

export const formatDayString = (date: Date | string | number) => {
  const getDate = new Date(date);
  if (isToday(getDate)) return dateAndTimeStrings.today;
  if (isYesterday(getDate)) return dateAndTimeStrings.yesterday;
  return getFormattedDate(getDate, dayAndMonthFormat);
};

export const addOrDeductMonth = (date: Date, numberOfMonths: number) =>
  addMonths(date, numberOfMonths);
