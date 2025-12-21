import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import * as schema from "./schema";

export const expoDb = openDatabaseSync("db.db", {
  enableChangeListener: true,
});

// Turn on foreign keys, they are off by default
expoDb.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(expoDb, { logger: false, schema });

export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

export type Wallet = InferSelectModel<typeof schema.wallet> & { currentBalance: number };

export type TransactionType = InferSelectModel<typeof schema.transactions>;
export type TransactionWithDetails = InferSelectModel<typeof schema.transactions> & {
  category: InferSelectModel<typeof schema.categories>;
  type: InferSelectModel<typeof schema.types> | null;
};
export type NewTransaction = InferInsertModel<typeof schema.transactions>;

export type TransferType = InferSelectModel<typeof schema.transfer>;
export type NewTransfer = InferInsertModel<typeof schema.transfer>;
export type TransferWithTransactions = InferSelectModel<typeof schema.transfer> & {
  fromTransaction: InferSelectModel<typeof schema.transactions> | null;
  toTransaction: InferSelectModel<typeof schema.transactions> | null;
};

export type CategoriesWithType = InferSelectModel<typeof schema.categories> & {
  types: InferSelectModel<typeof schema.types>[];
};
export type Category = InferSelectModel<typeof schema.categories>;
export type Type = InferSelectModel<typeof schema.types>;

export type NewCategory = InferInsertModel<typeof schema.categories>;
export type EditCategory = Partial<Omit<NewCategory, "id">> & { id: number };
