import { openDatabaseSync } from "expo-sqlite/next";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { InferInsertModel, InferSelectModel, InferModelFromColumns } from "drizzle-orm";
import * as schema from "./schema";

const expo = openDatabaseSync("db.db", { enableChangeListener: true });
export const db = drizzle(expo, { logger: false, schema });

export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

export type Wallet = InferSelectModel<typeof schema.wallet>;

export type Transaction = InferSelectModel<typeof schema.transactions>;
export type NewTransaction = InferInsertModel<typeof schema.transactions>;
