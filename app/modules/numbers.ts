import { Decimal } from "./types";

export const formatDecimalDigits = (
  number: number,
  thousandsSeparator: string,
  decimal: string
) => {
  if (typeof number !== "number") return "0,00";
  var parts = (Math.round(number * 100) / 100).toFixed(2).split(".");
  const numberPart = parts[0];
  const decimalPart = parts[1];
  const thousands = /\B(?=(\d{3})+(?!\d))/g;
  return (
    numberPart.replace(thousands, thousandsSeparator) + (decimalPart ? decimal + decimalPart : "")
  );
};

export const isNumber = (value: string) => /^[0-9]+$/.test(value);

export const hideValues = (value: string) => value.replace(/./g, "*");

export const roundDecimals = (value: number, fractionDigits = 2) =>
  Number(value.toFixed(fractionDigits));

export const formatLabelNumber = (label: string, decimal: Decimal = ",") => {
  const yNumber = parseFloat(label);
  const million = 1_000_000;
  const thousand = 1000;
  const toDecimal = (num: number, letter: string) => (yNumber / num).toFixed(2) + letter;
  let formatted;

  if (yNumber >= million) {
    formatted = toDecimal(million, "m");
  } else if (yNumber >= thousand) {
    formatted = toDecimal(thousand, "k");
  } else if (yNumber === 0) {
    formatted = "";
  } else {
    formatted = `${yNumber}`;
  }

  formatted = formatted
    .replace(/\.?0+([km])$/, "$1") // Remove trailing zeros after the decimal point
    .replace(/\./g, decimal) // Replace all decimal points with commas
    .replace(/(\d),0(\d[km])/, "$1,$2"); // Handle the formatting like "1,20k" to "1,2k"

  return formatted;
};
