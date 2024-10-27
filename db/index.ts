import { openDatabaseSync } from "expo-sqlite/next";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { users } from "./schema";

const expo = openDatabaseSync("db.db");
export const db = drizzle(expo, { logger: true });

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
