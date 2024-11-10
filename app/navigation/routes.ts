import { TransactionFromInputs } from "app/features/balance/modules/transactionFormValidation";

export type HomeStackParamList = {
  Balance: undefined;
  Monthly: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Transaction: { id: number } | undefined;
  TransactionSearch: undefined;
  WalletSettings: undefined;
  TransferForm: {
    walletId: number;
    editData?: { amount: number; transactionIdFrom?: number; transactionIdTo?: number };
  };
};
