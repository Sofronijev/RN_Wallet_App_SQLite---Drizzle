import { getAllWalletsWithBalance } from "app/services/walletQueries";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

const useGetWalletsWithBalance = () => {
  const { data } = useLiveQuery(getAllWalletsWithBalance());

  return data;
};

export default useGetWalletsWithBalance;
