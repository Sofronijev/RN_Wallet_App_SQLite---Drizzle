import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { File, Paths } from "expo-file-system";
import * as schema from "db/schema";
import migrations from "drizzle/migrations";
import { eq } from "drizzle-orm";
import {
  Category,
  TransactionType,
  TransferType,
  Type,
  UpcomingPayment,
  UpcomingPaymentContribution,
  UpcomingPaymentInstance,
  User,
  WalletType,
} from "db";
import {
  DatabaseFileError,
  WORKING_FILE_PREFIX,
  closeQuietly,
  createTimestamp,
  deleteQuietly,
  describeRestoreFailure,
  installDatabase,
  isSqliteFile,
  openLiveDatabase,
  pickBackupFile,
  purgeStaleWorkingFiles,
  restoreDatabaseSnapshot,
  verifyDatabaseIntegrity,
  type DatabaseFileResult,
  type PickedBackup,
} from "./databaseFile";

type Migration = {
  id: number;
  hash: string;
  created_at: number;
};

export type ExportData = {
  exportDate: string;
  migrations: Migration[];
  data: {
    users: User[];
    categories: Category[];
    types: Type[];
    wallet: WalletType[];
    transactions: TransactionType[];
    transfer: TransferType[];
    // Optional: backups created before the upcoming-payments feature don't have these
    upcomingPayments?: UpcomingPayment[];
    upcomingPaymentInstances?: UpcomingPaymentInstance[];
    upcomingPaymentContributions?: UpcomingPaymentContribution[];
  };
};

type ValidationResult = {
  isValid: boolean;
  error?: string;
  missingMigrations?: number;
};

export async function getCurrentMigrations(db: any): Promise<Migration[]> {
  try {
    const result = await db.getAllAsync(
      "SELECT id, hash, created_at FROM __drizzle_migrations ORDER BY id ASC",
    );
    return result || [];
  } catch (error) {
    console.error("Error fetching migrations:", error);
    return [];
  }
}

export function validateImportedDatabase(
  currentMigrations: Migration[],
  importedMigrations: Migration[],
): ValidationResult {
  if (importedMigrations.length > currentMigrations.length) {
    return {
      isValid: false,
      error: `That backup was made with a newer version of SpendyFly. Please update the app, then try again.`,
    };
  }

  for (let i = 0; i < importedMigrations.length; i++) {
    if (importedMigrations[i].hash !== currentMigrations[i].hash) {
      return {
        isValid: false,
        error: `That backup does not work with this version of SpendyFly.`,
      };
    }
  }

  return {
    isValid: true,
    error: "",
  };
}

/** Replaces all rows with a JSON backup's. The database must already be migrated. */
export async function applyBackupData(
  expoDb: SQLiteDatabase,
  importData: ExportData,
): Promise<void> {
  const db = drizzle(expoDb, { schema });

  // Must run before BEGIN (no-op inside a transaction), so ON DELETE SET NULL works.
  await expoDb.execAsync("PRAGMA foreign_keys = ON;");
  await expoDb.execAsync("BEGIN TRANSACTION");

  try {
    // Delete all existing data (in reverse order due to foreign keys)
    await db.delete(schema.upcomingPaymentContributions);
    await db.delete(schema.upcomingPaymentInstances);
    await db.delete(schema.upcomingPayments);
    await db.delete(schema.transfer);
    await db.delete(schema.transactions);
    await db.delete(schema.wallet);
    await db.delete(schema.types);
    await db.delete(schema.categories);
    // Don't delete users, we'll update instead

    // Import new data
    if (importData.data.categories.length > 0) {
      await db.insert(schema.categories).values(importData.data.categories);
    }
    if (importData.data.types.length > 0) {
      await db.insert(schema.types).values(importData.data.types);
    }
    if (importData.data.wallet.length > 0) {
      await db.insert(schema.wallet).values(importData.data.wallet);
    }
    // Transfers first: Transactions.transfer_id references Transfer.id.
    if (importData.data.transfer.length > 0) {
      await db.insert(schema.transfer).values(importData.data.transfer);
    }
    if (importData.data.transactions.length > 0) {
      await db.insert(schema.transactions).values(importData.data.transactions);
    }

    // Upcoming payments are optional — older backups don't contain them
    const upcomingPayments = importData.data.upcomingPayments ?? [];
    const upcomingPaymentInstances = importData.data.upcomingPaymentInstances ?? [];
    const upcomingPaymentContributions = importData.data.upcomingPaymentContributions ?? [];
    if (upcomingPayments.length > 0) {
      await db.insert(schema.upcomingPayments).values(upcomingPayments);
    }
    if (upcomingPaymentInstances.length > 0) {
      await db.insert(schema.upcomingPaymentInstances).values(upcomingPaymentInstances);
    }
    if (upcomingPaymentContributions.length > 0) {
      await db.insert(schema.upcomingPaymentContributions).values(upcomingPaymentContributions);
    }

    // Update user wallet selections instead of replacing
    if (importData.data.users.length > 0) {
      const importedUser = importData.data.users[0]; // First user from backup
      await db
        .update(schema.users)
        .set({
          selectedWalletId: importedUser.selectedWalletId,
          primaryWalletId: importedUser.primaryWalletId,
        })
        .where(eq(schema.users.id, importedUser.id));
    }

    await expoDb.execAsync("COMMIT");
  } catch (error) {
    await expoDb.execAsync("ROLLBACK");
    throw error;
  }
}

/**
 * Builds a fresh database in the cache from a .json backup, then installs it,
 * so a failure never leaves the live data half-replaced.
 */
export async function restoreJsonBackup(picked?: PickedBackup): Promise<DatabaseFileResult> {
  const rebuildName = `${WORKING_FILE_PREFIX}json_rebuild_${createTimestamp()}.db`;
  const rebuildFile = new File(Paths.cache, rebuildName);
  let rebuildDatabase: SQLiteDatabase | null = null;

  try {
    const source = picked ?? (await pickBackupFile());

    if (!source) {
      return { success: false, canceled: true, message: "Restore canceled." };
    }

    const sourceFile = new File(source.uri);
    purgeStaleWorkingFiles(rebuildName, sourceFile.name);

    const importData = JSON.parse(await sourceFile.text()) as ExportData | null;

    if (!importData?.migrations || !importData?.data) {
      throw new DatabaseFileError("That file is not a SpendyFly backup.");
    }

    deleteQuietly(rebuildFile);
    rebuildDatabase = await openDatabaseAsync(rebuildName, {}, Paths.cache.uri);
    await migrate(drizzle(rebuildDatabase, { schema }), migrations);

    const currentMigrations = await getCurrentMigrations(rebuildDatabase);
    const validation = validateImportedDatabase(currentMigrations, importData.migrations);
    if (!validation.isValid) {
      throw new DatabaseFileError(
        validation.error || "That backup does not work with this version of SpendyFly.",
      );
    }

    await applyBackupData(rebuildDatabase, importData);
    await verifyDatabaseIntegrity(rebuildDatabase);

    return await installDatabase(rebuildDatabase, "Your data was restored.");
  } catch (error) {
    console.error("Failed to restore JSON backup", error);

    return {
      success: false,
      message: describeRestoreFailure(error, "SpendyFly could not load that file."),
    };
  } finally {
    await closeQuietly(rebuildDatabase);
    deleteQuietly(rebuildFile);
  }
}

/** Imports a .db or an old .json backup, detected from the file header. */
export async function importBackup(): Promise<DatabaseFileResult> {
  try {
    const picked = await pickBackupFile();

    if (!picked) {
      return { success: false, canceled: true, message: "Import canceled" };
    }

    return isSqliteFile(new File(picked.uri))
      ? await restoreDatabaseSnapshot(picked)
      : await restoreJsonBackup(picked);
  } catch (error) {
    console.error("Import error:", error);

    return {
      success: false,
      message: "SpendyFly could not load that file. Your existing data was not replaced.",
    };
  }
}

export async function deleteAllData(): Promise<{
  success: boolean;
  message: string;
}> {
  let live: Awaited<ReturnType<typeof openLiveDatabase>> | null = null;

  try {
    live = await openLiveDatabase();
    const expoDb = live.database;

    // Off so DROP TABLE can't trip a constraint; must run before BEGIN.
    await expoDb.execAsync("PRAGMA foreign_keys = OFF;");
    await expoDb.execAsync("BEGIN TRANSACTION");

    try {
      // Drop all user tables (in reverse order due to foreign keys)
      await expoDb.execAsync(`
        DROP TABLE IF EXISTS UpcomingPaymentContributions;
        DROP TABLE IF EXISTS UpcomingPaymentInstances;
        DROP TABLE IF EXISTS UpcomingPayments;
        DROP TABLE IF EXISTS transfer;
        DROP TABLE IF EXISTS transactions;
        DROP TABLE IF EXISTS wallet;
        DROP TABLE IF EXISTS types;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS users;
      `);

      // Drop migrations table to force re-run of all migrations on app restart
      await expoDb.execAsync(`
        DROP TABLE IF EXISTS __drizzle_migrations;
      `);

      // sqlite_sequence is automatically reset when tables are dropped

      await expoDb.execAsync("COMMIT");

      return {
        success: true,
        message: "All your data has been deleted.",
      };
    } catch (error) {
      await expoDb.execAsync("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: false,
      message: `Delete error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  } finally {
    if (live) {
      try {
        await live.database.execAsync("PRAGMA foreign_keys = ON;");
      } catch (pragmaError) {
        console.warn("Could not restore the foreign_keys pragma", pragmaError);
      }

      await live.release();
    }
  }
}
