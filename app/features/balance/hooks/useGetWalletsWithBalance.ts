import { getAllWallets, getAllWalletsWithBalance } from "app/services/walletQueries";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

const useGetWalletsWithBalance = () => {
  // TODO: Use getAllWallets to track if startingBalance is updated, in case it is this will trigger it
  // After it is used in getAllWalletsWithBalance as deps so it triggers getAllWalletsWithBalance and shows new balance
  // This can be removed when this is added https://github.com/drizzle-team/drizzle-orm/issues/2660
  const { data: wallets } = useLiveQuery(getAllWallets());
  const { data } = useLiveQuery(getAllWalletsWithBalance(), [wallets]);

  return data;
};

export default useGetWalletsWithBalance;
