import { getTransactions } from "app/services/transactionQueries";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

const useGetTransactions = (walletId: number | null, limit?: number) => {
  const { data } = useLiveQuery(getTransactions(walletId, limit), [walletId, limit]);

  return data;
};

export default useGetTransactions;
