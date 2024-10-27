import { openDatabaseSync } from "expo-sqlite/next";
import { drizzle } from "drizzle-orm/expo-sqlite";

const expo = openDatabaseSync("db.db");
export const db = drizzle(expo, { logger: true });
