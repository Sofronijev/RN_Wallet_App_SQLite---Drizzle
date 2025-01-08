export const formatDecimalDigits = (number: number) => {
  if (typeof number !== "number") return "0,00";
  var parts = (Math.round(number * 100) / 100).toFixed(2).split(".");
  const numberPart = parts[0];
  const decimalPart = parts[1];
  const thousands = /\B(?=(\d{3})+(?!\d))/g;
  return numberPart.replace(thousands, ".") + (decimalPart ? "," + decimalPart : "");
};

export const isNumber = (value: string | number) => !isNaN(+value);
