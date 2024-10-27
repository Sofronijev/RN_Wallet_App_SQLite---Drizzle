import * as SQLite from "expo-sqlite";
const sqliteDb = SQLite.openDatabaseSync("db.db");
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

const useStudio = () => {
  useDrizzleStudio(sqliteDb);
};

export default useStudio;
