import { getSelectedWalletInfo } from "app/services/userQueries";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

const useGetSelectedWallet = () => {
  const { data } = useLiveQuery(getSelectedWalletInfo());

  return {
    selectedWalletId: data?.selectedWalletId ?? null,
    selectedWallet: data?.selectedWallet ?? null,
  };
};

export default useGetSelectedWallet;
