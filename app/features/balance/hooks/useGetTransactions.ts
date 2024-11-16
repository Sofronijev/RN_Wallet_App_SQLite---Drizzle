import { getTransactions, getTransactionsCount } from "app/services/transactionQueries";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

const useGetTransactions = (walletId: number | null, limit?: number, offset?: number) => {
  const { data } = useLiveQuery(getTransactions(walletId, limit, offset), [walletId, limit, offset]);
  const { data: countData } = useLiveQuery(getTransactionsCount(walletId), [walletId]);

  return {
    data,
    count: countData[0]?.count ?? 0,
  };
};

export default useGetTransactions;
