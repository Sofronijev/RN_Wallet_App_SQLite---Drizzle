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

// Accepts the top-level `db` or a transaction `tx`, so helpers can run inside
// or outside an existing db.transaction(...) block.
export type DbExecutor = Parameters<Parameters<typeof db.transaction>[0]>[0] | typeof db;

export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;
export type WalletType = InferSelectModel<typeof schema.wallet>;

export type Wallet = InferSelectModel<typeof schema.wallet> & { currentBalance: number };

export type TransactionType = InferSelectModel<typeof schema.transactions>;
export type TransactionListItem = TransactionType & {
  linkedPaymentName: string | null;
};
export type TransactionWithDetails = InferSelectModel<typeof schema.transactions> & {
  category: InferSelectModel<typeof schema.categories>;
  type: InferSelectModel<typeof schema.types> | null;
  upcomingPayment: { instanceId: number } | null;
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

export type NewCategory = InferInsertModel<typeof schema.categories> & { types: EditType[] };
export type EditCategory = Partial<Omit<NewCategory, "id">> & { id: number; types: EditType[] };

export type NewType = InferInsertModel<typeof schema.types>;
export type EditType = Omit<NewType, "id"> & { id: number };

export type UpcomingPayment = InferSelectModel<typeof schema.upcomingPayments>;
export type NewUpcomingPayment = InferInsertModel<typeof schema.upcomingPayments>;
export type EditUpcomingPayment = Partial<Omit<NewUpcomingPayment, "id" | "createdAt" | "userId">>;

export type UpcomingPaymentInstance = InferSelectModel<typeof schema.upcomingPaymentInstances>;
export type UpcomingPaymentContribution = InferSelectModel<
  typeof schema.upcomingPaymentContributions
>;
