import { db } from "db";
import { transactions, wallet } from "db/schema";
import { eq, getTableColumns, sql, and, gte, lte, lt } from "drizzle-orm";
import { addTransaction } from "./transactionQueries";
import { formatIsoDate } from "modules/timeAndDate";
import { CategoryNumber, typeIds } from "modules/categories";
import { getSelectedWalletInfo, setSelectedWallet } from "./userQueries";
import { addDays, format, startOfDay, subDays } from "date-fns";

export const getAllWalletsWithBalance = () =>
  db
    .select({
      ...getTableColumns(wallet),
      currentBalance:
        sql`COALESCE(SUM(${transactions.amount}), 0) + ${wallet.startingBalance}`.mapWith(
          transactions.amount
        ),
    })
    .from(transactions)
    .rightJoin(wallet, eq(wallet.walletId, transactions.wallet_id))
    .groupBy(
      wallet.walletId,
      wallet.startingBalance,
      wallet.walletName,
      wallet.currencyCode,
      wallet.currencySymbol
    );

export const setWalletStartingBalance = (walletId: number, amount: number) =>
  db.update(wallet).set({ startingBalance: amount }).where(eq(wallet.walletId, walletId));

export const changeCurrentBalance = (
  wallet_id: number,
  currentBalance: number,
  newBalance: number
) => {
  const balanceDifference = Number((newBalance - currentBalance).toFixed(2));
  const isPositive = balanceDifference >= 0;
  const type = isPositive ? typeIds.transfer_received : typeIds.transfer_send;

  return addTransaction({
    amount: balanceDifference,
    categoryId: CategoryNumber.balanceCorrection,
    type_id: type,
    wallet_id,
    date: formatIsoDate(new Date()),
    description: `Balance correction. New balance: ${newBalance}`,
  });
};

export const getWalletInfo = (walletId: number) => {
  return db.query.wallet.findFirst({
    where: eq(wallet.walletId, walletId),
  });
};

export const setWalletCurrency = (walletId: number, currencyCode: string, currencySymbol: string) =>
  db.update(wallet).set({ currencyCode, currencySymbol }).where(eq(wallet.walletId, walletId));

export const setColorCurrency = (walletId: number, color: string) =>
  db.update(wallet).set({ color }).where(eq(wallet.walletId, walletId));

export const createNewWallet = (walletName: string) => db.insert(wallet).values({ walletName });

export const setWalletName = (walletId: number, walletName: string) =>
  db.update(wallet).set({ walletName }).where(eq(wallet.walletId, walletId));

export const deleteWallet = async (walletId: number) => {
  await db.transaction(async (trx) => {
    await trx.delete(wallet).where(eq(wallet.walletId, walletId));
    const selectedWallet = await getSelectedWalletInfo();

    // if selected wallet is deleted, need to set new selected wallet from the ones in the db
    if (selectedWallet?.selectedWalletId === walletId) {
      const wallet = await trx.query.wallet.findFirst();
      if (wallet) {
        await setSelectedWallet(wallet.walletId);
      }
    }
  });
};

export const getWalletBalanceHistory = async (walletId: number, days: number = 30) => {
  const today = startOfDay(new Date());
  const startDate = startOfDay(subDays(today, days - 1)); // poslednji datum = danas

  // 1️⃣ Uzmi starting balance + sum transakcija pre startDate
  const startingData = await db
    .select({
      startingBalanceWithPrevTx: sql<number>`
        COALESCE(SUM(${transactions.amount}), 0) + ${wallet.startingBalance}
      `.mapWith(Number),
    })
    .from(transactions)
    .leftJoin(wallet, eq(wallet.walletId, transactions.wallet_id))
    .where(
      and(
        eq(transactions.wallet_id, walletId),
        lt(transactions.date, startDate.toISOString()) // sve pre startDate
      )
    )
    .limit(1);

  const runningBalanceStart = startingData[0]?.startingBalanceWithPrevTx ?? 0;

  // 2️⃣ Uzmi sve transakcije za period od startDate do danas
  const periodTransactions = await db
    .select({
      amount: transactions.amount,
      date: transactions.date,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.wallet_id, walletId),
        gte(transactions.date, startDate.toISOString()),
        lte(transactions.date, today.toISOString())
      )
    )
    .orderBy(sql`DATE(${transactions.date})`);

  // 3️⃣ Grupisanje transakcija po danu
  const transactionsByDate = new Map<string, number>();
  periodTransactions.forEach((transaction) => {
    const day = format(new Date(transaction.date), "yyyy-MM-dd");
    transactionsByDate.set(day, (transactionsByDate.get(day) ?? 0) + transaction.amount);
  });

  // 4️⃣ Generiši running total za poslednjih 'days' dana
  let runningBalance = runningBalanceStart;
  const result = [];

  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const dateOnly = format(date, "yyyy-MM-dd");

    const dailyChange = transactionsByDate.get(dateOnly) ?? 0;
    runningBalance += dailyChange;

    result.push({
      date: dateOnly,
      totalBalance: Number(runningBalance.toFixed(2)),
    });
  }

  return result;
};
