import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSelectedWalletInfo, setSelectedWallet } from "app/services/userQueries";
import {
  changeCurrentBalance,
  getAllWalletsWithBalance,
  setWalletCurrency,
  setWalletStartingBalance,
} from "app/services/walletQueries";
import { queryKeys } from "./index";

export const useGetSelectedWalletQuery = () => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.selectedWallet],
    queryFn: getSelectedWalletInfo,
  });

  return {
    data: data?.selectedWallet ?? null,
    isLoading: isLoading || isFetching,
    isError,
  };
};

export const useGetWalletsWithBalance = () => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.wallets],
    queryFn: getAllWalletsWithBalance,
  });

  return { data: data ?? [], isLoading: isLoading || isFetching, isError };
};
export type WalletType = ReturnType<typeof useGetWalletsWithBalance>["data"][number];

export const setSelectedWalletMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (id: number) => setSelectedWallet(id),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.selectedWallet] });
    },
  });

  return {
    setSelectedWallet: mutate,
    isLoading: isPending,
    isError,
  };
};

export const setStartingBalanceMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      setWalletStartingBalance(id, amount),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.monthlyBalance] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.wallets] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.selectedWallet] });
    },
  });

  return {
    setStartingBalance: mutate,
    isLoading: isPending,
    isError,
  };
};

export const changeCurrentBalanceMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: ({
      id,
      currentAmount,
      newAmount,
    }: {
      id: number;
      currentAmount: number;
      newAmount: number;
    }) => changeCurrentBalance(id, currentAmount, newAmount),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.monthlyBalance] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.wallets] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.selectedWallet] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.transactions] });
    },
  });

  return {
    changeCurrentBalance: mutate,
    isLoading: isPending,
    isError,
  };
};

export const setCurrencyMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: ({
      id,
      currencyCode,
      currencySymbol,
    }: {
      id: number;
      currencyCode: string;
      currencySymbol: string;
    }) => setWalletCurrency(id, currencyCode, currencySymbol),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.wallets] });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.selectedWallet] });
    },
  });

  return {
    setCurrency: mutate,
    isLoading: isPending,
    isError,
  };
};
