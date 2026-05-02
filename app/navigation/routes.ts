import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export type HomeStackParamList = {
  Balance: undefined;
  Monthly: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Transaction: { id?: number; upcomingPaymentInstanceId?: number } | undefined;
  TransactionSearch: undefined;
  WalletSettings: undefined;
  TransferForm: {
    walletId: number;
    editTransferId?: number;
  };
  PinSettings: undefined;
  NumberSeparators: undefined;
  TransactionFilters: undefined;
  CategorySettings: undefined;
  CategoryForm: { id: number } | undefined;
  DashboardSettings: undefined;
  ExportImport: undefined;
  AboutApp: undefined;
  UpcomingPayment: { id: number } | undefined;
  UpcomingPaymentDetails: { id: number };
  UpcomingPaymentsMonth: undefined;
  UpcomingPaymentsSettings: undefined;
};

export type AuthStackParamList = {
  PinCode: undefined;
};

export const useAppNavigation = useNavigation<StackNavigationProp<AppStackParamList>>;
