import { getAllWallets } from "app/services/walletQueries";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

const useGetWallets = () => {
  const { data } = useLiveQuery(getAllWallets());

  return data;
};

export default useGetWallets;
