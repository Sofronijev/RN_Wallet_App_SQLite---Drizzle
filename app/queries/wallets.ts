import { useQuery } from "@tanstack/react-query";
import { getSelectedWalletInfo } from "app/services/userQueries";
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
