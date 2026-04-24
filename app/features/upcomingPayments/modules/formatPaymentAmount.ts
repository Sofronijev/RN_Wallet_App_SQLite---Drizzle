import { formatDecimalDigits } from "modules/numbers";

type Options = {
  delimiter: string;
  decimal: string;
  currency?: string;
  nullLabel?: string;
};

export const formatPaymentAmount = (
  amount: number | null | undefined,
  { delimiter, decimal, currency, nullLabel = "—" }: Options,
) => {
  if (amount == null) return nullLabel;
  const formatted = formatDecimalDigits(amount, delimiter, decimal);
  return currency ? `${formatted} ${currency}` : formatted;
};
