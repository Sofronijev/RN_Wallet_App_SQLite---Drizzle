import { CategoriesWithType, TransactionWithDetails, Wallet } from "db";
import { formatIsoDate } from "modules/timeAndDate";
import { UpcomingPaymentInstanceContext } from "app/queries/upcomingPayments";
import { sameCurrency } from "modules/currency";
import { TransactionFromInputs } from "./transactionFormValidation";

export const getDefaultInitialValues = (
  selectedWalletId: number | undefined,
  today: Date,
): TransactionFromInputs => ({
  date: formatIsoDate(today),
  amount: 0,
  description: "",
  category: null,
  type: null,
  walletId: `${selectedWalletId}`,
  linkedUpcomingInstanceId: null,
});

export const formatEditInitialValues = (
  transaction: TransactionWithDetails,
): TransactionFromInputs => ({
  date: formatIsoDate(transaction.date),
  amount: Math.abs(transaction.amount),
  description: transaction.description ?? "",
  category: transaction.category,
  type: transaction.type,
  walletId: `${transaction.wallet_id}`,
  linkedUpcomingInstanceId: transaction.upcomingPayment?.instanceId ?? null,
});

type PayDeps = {
  wallets: Wallet[];
  categoriesById: Record<number, CategoriesWithType>;
  selectedWalletId: number | undefined;
  today: Date;
};

export const formatPayInitialValues = (
  ctx: UpcomingPaymentInstanceContext,
  { wallets, categoriesById, selectedWalletId, today }: PayDeps,
): TransactionFromInputs => {
  const matchingWallet = wallets.find((w) => sameCurrency(w.currencyCode, ctx.currencyCode));
  const chosenWallet = matchingWallet ?? wallets.find((w) => w.walletId === selectedWalletId);
  const isSameCurrency = chosenWallet
    ? sameCurrency(chosenWallet.currencyCode, ctx.currencyCode)
    : true;
  const category = categoriesById[ctx.categoryId] ?? null;
  const type = ctx.typeId != null ? category?.types.find((t) => t.id === ctx.typeId) ?? null : null;
  return {
    date: formatIsoDate(today),
    amount: isSameCurrency && ctx.expectedAmount != null ? ctx.expectedAmount : 0,
    description: ctx.paymentDescription ?? "",
    category,
    type,
    walletId: `${chosenWallet?.walletId ?? selectedWalletId}`,
    linkedUpcomingInstanceId: ctx.instanceId,
  };
};
