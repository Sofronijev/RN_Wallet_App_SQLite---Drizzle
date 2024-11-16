import { db } from "db";
import { count, sql, TableConfig } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

// Used to skip expensive query until skip is added to useLiveQuery
// https://github.com/drizzle-team/drizzle-orm/issues/2765
export const skipQuery = <T extends TableConfig>(tableName: SQLiteTable<T>) =>
  db
    .select()
    .from(tableName)
    .where(sql`1=0`);

export const skipCount = <T extends TableConfig>(tableName: SQLiteTable<T>) =>
  db
    .select({ count: count() })
    .from(tableName)
    .where(sql`1=0`);
