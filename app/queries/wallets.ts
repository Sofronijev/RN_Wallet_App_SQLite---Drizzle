import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSelectedWalletInfo, setSelectedWallet } from "app/services/userQueries";
import { getAllWalletsWithBalance } from "app/services/walletQueries";
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

  return { data: data ?? [], isLoading, isFetching, isError };
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
