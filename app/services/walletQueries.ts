import { db } from "db";
import { wallet } from "db/schema";

export const getAllWallets = () => {
  return db.select().from(wallet);
};
