import { getMonthlyBalance } from "app/services/transactionQueries";
import { format } from "date-fns";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { apiIsoFormat } from "modules/timeAndDate";

const useGetMonthlyBalance = (walletId: number | null, date: number | Date) => {
  const { data } = useLiveQuery(getMonthlyBalance(walletId, format(date, apiIsoFormat)), [
    walletId,
    date,
  ]);

  const { balance, expense, income } = data[0] ? data[0] : { balance: 0, expense: 0, income: 0 };

  return {
    balance,
    expense,
    income,
  };
};

export default useGetMonthlyBalance;
