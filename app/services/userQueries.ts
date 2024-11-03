import { db } from "db";
import { users } from "db/schema";
import { eq } from "drizzle-orm";

export const getUser = () => db.query.users.findFirst({ with: { selectedWallet: true } });

export const setSelectedWallet = (userId: number, selectedWalletId: number) =>
  db.update(users).set({ selectedWalletId }).where(eq(users.id, userId));
