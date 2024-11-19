import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import {
  getMonthlyBalance,
  getTransactionById,
  getTransactions,
} from "app/services/transactionQueries";
import { format } from "date-fns";
import { apiIsoFormat } from "modules/timeAndDate";
import { queryKeys } from ".";

export const useGetMonthlyBalanceQuery = (
  walletId: number | null | undefined,
  date: number | Date
) => {
  const { data, isError, isLoading, isFetching } = useQuery({
    enabled: !!walletId && !!date,
    // staleTime: 1000 * 60 * 5,
    queryKey: [queryKeys.monthlyBalance, walletId, date],
    queryFn: walletId ? () => getMonthlyBalance(walletId, format(date, apiIsoFormat)) : skipToken,
  });
  const monthlyBalance = data?.[0] ? data[0] : { balance: 0, expense: 0, income: 0 };

  return {
    data: monthlyBalance,
    isLoading: isLoading || isFetching,
    isError,
  };
};

export const useGetTransactionsQuery = (
  walletId: number | null | undefined,
  limit?: number,
  offset?: number
) => {
  const { data, isError, isLoading, isFetching } = useQuery({
    enabled: !!walletId,
    // staleTime: 1000 * 60 * 5,
    queryKey: [queryKeys.transactions, walletId, limit, offset],
    queryFn: walletId ? () => getTransactions(walletId, limit, offset) : skipToken,
  });
  const transactions = data?.[0] ? data[0] : [];
  const count = data?.[1] ? data[1][0].count : 0;
  return {
    data: {
      transactions,
      count,
    },
    isError,
    isLoading,
    isFetching,
  };
};

export const useGetTransactionByIdQuery = (transactionId: number | null | undefined) => {
  const { data, isLoading, isFetching, isError } = useQuery({
    enabled: !!transactionId,
    queryKey: [queryKeys.transactionId, transactionId],
    queryFn: transactionId ? () => getTransactionById(transactionId) : skipToken,
  });
  return {
    data,
    isLoading: isLoading || isFetching,
    isError,
  };
};

// export const useGetTransactionByIdMutation = () => {
//   const { mutate, isPending, isError } = useMutation({
//     mutationFn: (id: number) => getTransactionById(id),
//   });

//   return {
//     getTransactionById: mutate,
//     isLoading: isPending,
//     isError,
//   };
// };
