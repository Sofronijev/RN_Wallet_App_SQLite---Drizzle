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
