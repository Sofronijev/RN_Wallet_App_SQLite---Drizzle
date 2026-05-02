export const sameCurrency = (
  a: string | null | undefined,
  b: string | null | undefined,
): boolean => (a ?? "") === (b ?? "");

export const displayCurrency = (
  source: { currencySymbol?: string | null; currencyCode?: string | null } | null | undefined,
): string => source?.currencySymbol || source?.currencyCode || "";
