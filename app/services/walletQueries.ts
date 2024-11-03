import { db } from "db";
import { wallet } from "db/schema";
import { eq } from "drizzle-orm";

export const getAllWallets = (userId?: number) =>
  db
    .select()
    .from(wallet)
    .where(userId ? eq(wallet.walletId, userId) : undefined);
