import { getSelectedWalletInfo } from "app/services/userQueries";
import { getAllWallets } from "app/services/walletQueries";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

const useGetSelectedWallet = () => {
  // TODO: Use getAllWallets to track if startingBalance is updated, in case it is this will trigger it
  // After it is used in getSelectedWalletInfo as deps so it triggers getSelectedWalletInfo and shows new balance
  // This can be removed when this is added https://github.com/drizzle-team/drizzle-orm/issues/2660
  const { data: wallets } = useLiveQuery(getAllWallets());
  const { data } = useLiveQuery(getSelectedWalletInfo(), [wallets]);

  return {
    selectedWalletId: data?.selectedWalletId ?? null,
    selectedWallet: data?.selectedWallet ?? null,
  };
};

export default useGetSelectedWallet;
