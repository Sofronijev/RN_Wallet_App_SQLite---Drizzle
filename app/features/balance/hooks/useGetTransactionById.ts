import { getTransactionById } from "app/services/transactionQueries";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

const useGetTransactionById = (id: number | null | undefined) => {
  const { data } = useLiveQuery(getTransactionById(id), [id]);

  return data;
};

export default useGetTransactionById;
