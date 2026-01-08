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

export const formatLabelNumber = (label: string, decimal = ",") => {
  const yNumber = parseFloat(label);
  const absNumber = Math.abs(yNumber);
  const million = 1_000_000;
  const thousand = 1000;

  const toDecimal = (num: number, letter: string) => (absNumber / num).toFixed(2) + letter;

  let formatted;

  if (absNumber >= million) {
    formatted = toDecimal(million, "m");
  } else if (absNumber >= thousand) {
    formatted = toDecimal(thousand, "k");
  } else if (yNumber === 0) {
    formatted = "0";
  } else {
    formatted = absNumber.toFixed(2);
  }

  // vrati znak negativnosti ako je potrebno
  if (yNumber < 0 && yNumber !== 0) {
    formatted = "-" + formatted;
  }

  formatted = formatted
    // 1. ukloni ceo decimalni deo ako je .00k / .00m
    .replace(/\.00([km])$/, "$1")
    // 2. ukloni trailing nule tipa .20k → .2k
    .replace(/\.(\d*[1-9])0+([km])$/, ".$1$2")
    // 3. zameni decimalnu tačku zarezom
    .replace(/\./g, decimal);

  return formatted;
};

export const getRoundedUpperBound = (number: number) => {
  const sign = number < 0 ? -1 : 1;
  const abs = Math.abs(number);

  if (abs < 0) return 1 * sign;

  if (abs < 10) {
    return Math.ceil(abs) * sign;
  }

  // red veličine (10, 100, 1000, ...)
  const magnitude = Math.pow(10, Math.floor(Math.log10(abs)));

  // korak za zaokruživanje:
  // 10  → 1
  // 100 → 10
  // 1000 → 100
  // 10000 → 1000
  const step = magnitude / 10;

  return Math.ceil(abs / step) * step * sign;
};

export const getRoundedLowerBound = (number: number) => {
  const sign = number < 0 ? -1 : 1;
  const abs = Math.abs(number);

  if (abs === 0) return 0;

  if (abs < 10) {
    return Math.floor(abs) * sign;
  }

  const magnitude = Math.pow(10, Math.floor(Math.log10(abs)));
  const step = magnitude / 10;

  return Math.floor(abs / step) * step * sign;
};
