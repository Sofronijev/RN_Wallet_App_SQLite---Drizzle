import { db } from "db";
import { sql } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

// Used to skip expensive query until skip is added to useLiveQuery
// https://github.com/drizzle-team/drizzle-orm/issues/2765
export const skipQuery = (tableName: SQLiteTable) =>
  db
    .select()
    .from(tableName)
    .where(sql`1=0`);
