import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addTransaction,
  deleteTransaction,
  editTransaction,
  getInfiniteTransactions,
  getMonthlyAmountsByCategory,
  getMonthlyBalance,
  getTransactionById,
  getTransactions,
} from "app/services/transactionQueries";
import { format } from "date-fns";
import { apiIsoFormat } from "modules/timeAndDate";
import { queryKeys } from "./index";
import { NewTransaction, TransactionType } from "db";

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

export const useGetMonthlyGraphDataQuery = (
  walletId: number | null | undefined,
  date: number | Date
) => {
  const { data, isError, isLoading, isFetching } = useQuery({
    enabled: !!walletId && !!date,
    queryKey: [queryKeys.monthlyGraph, walletId, date],
    queryFn: walletId
      ? () => getMonthlyAmountsByCategory(walletId, format(date, apiIsoFormat))
      : skipToken,
  });
  const graphData = data ?? [];

  return {
    data: graphData,
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

type InfiniteTransactionsReturn = Awaited<ReturnType<typeof getInfiniteTransactions>>;

export const useGetTransactionsInfiniteQuery = (
  walletId: number | null | undefined,
  pageSize = 30
) => {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isError, isLoading } =
    useInfiniteQuery({
      enabled: !!walletId,
      queryKey: [queryKeys.transactions, walletId, pageSize],
      getNextPageParam: (prevData: InfiniteTransactionsReturn) => {
        return prevData?.nextPage;
      },
      queryFn: walletId
        ? ({ pageParam }) => getInfiniteTransactions(walletId, pageParam, pageSize)
        : skipToken,
      initialPageParam: 1,
      // staleTime: 1000 * 60 * 5,
    });
  const transactions = data?.pages?.flatMap((page) => page.data) ?? [];

  return {
    data: transactions,
    isError,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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

export const addTransactionMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (transaction: NewTransaction) => addTransaction(transaction),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.transactions] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.monthlyBalance] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.wallets] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.monthlyGraph] });
    },
  });

  return {
    addTransaction: mutate,
    isLoading: isPending,
    isError,
  };
};

export const editTransactionMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: ({ id, transaction }: { id: number; transaction: Partial<TransactionType> }) =>
      editTransaction(id, transaction),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.transactions] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.monthlyBalance] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.wallets] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.monthlyGraph] });
    },
  });
  return {
    editTransaction: mutate,
    isLoading: isPending,
    isError,
  };
};

export const deleteTransactionMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.transactions] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.monthlyBalance] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.wallets] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.monthlyGraph] });
    },
  });

  return {
    deleteTransaction: mutate,
    isLoading: isPending,
    isError,
  };
};
