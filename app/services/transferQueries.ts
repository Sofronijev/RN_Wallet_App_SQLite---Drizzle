import { db, NewTransfer } from "db";
import { transfer } from "db/schema";

export const addTransfer = (transaction: NewTransfer) => db.insert(transfer).values(transaction);
