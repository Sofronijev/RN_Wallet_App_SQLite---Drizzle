import { db, NewTransfer } from "db";
import { transfer } from "db/schema";
import { eq } from "drizzle-orm";

export const addTransfer = (transaction: NewTransfer) => db.insert(transfer).values(transaction);

export const getTransferId = (id: number) =>
  db.query.transfer.findFirst({
    where: eq(transfer.id, id),
    with: { fromTransaction: true, toTransaction: true },
  });
