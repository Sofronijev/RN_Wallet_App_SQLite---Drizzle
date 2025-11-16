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
    editTransferId?: number;
  };
  PinSettings: undefined;
  NumberSeparators: undefined;
};

export type AuthStackParamList = {
  PinCode: undefined;
};
