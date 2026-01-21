import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { File, Paths } from "expo-file-system";
import * as schema from "db/schema";
import { eq } from "drizzle-orm";
import { Category, TransactionType, TransferType, Type, User, Wallet, WalletType } from "db";

type Migration = {
  id: number;
  hash: string;
  created_at: number;
};

type ExportData = {
  exportDate: string;
  migrations: Migration[];
  data: {
    users: User[];
    categories: Category[];
    types: Type[];
    wallet: WalletType[];
    transactions: TransactionType[];
    transfer: TransferType[];
  };
};

type ValidationResult = {
  isValid: boolean;
  error?: string;
  missingMigrations?: number;
};

const DB_NAME = "db.db";

async function getCurrentMigrations(db: any): Promise<Migration[]> {
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

function validateImportedDatabase(
  currentMigrations: Migration[],
  importedMigrations: Migration[],
): ValidationResult {
  if (importedMigrations.length > currentMigrations.length) {
    return {
      isValid: false,
      error: `The backup was created with a newer version of the app. Please update your app before importing.`,
    };
  }

  for (let i = 0; i < importedMigrations.length; i++) {
    if (importedMigrations[i].hash !== currentMigrations[i].hash) {
      return {
        isValid: false,
        error: `The backup is not compatible with the current app version. Please use a backup from this app version.`,
      };
    }
  }

  return {
    isValid: true,
    error: "",
  };
}

export async function exportDatabase(): Promise<{
  success: boolean;
  message: string;
  filePath?: string;
}> {
  const fileName = `backup_spendyfly_${new Date().toISOString().split("T")[0]}_${Date.now()}.json`;
  const file = new File(Paths.document, fileName);
  try {
    const expoDb = openDatabaseSync(DB_NAME);
    const db = drizzle(expoDb, { schema });

    const migrations = await getCurrentMigrations(expoDb);

    const users = await db.select().from(schema.users);
    const categories = await db.select().from(schema.categories);
    const types = await db.select().from(schema.types);
    const wallets = await db.select().from(schema.wallet);
    const transactions = await db.select().from(schema.transactions);
    const transfers = await db.select().from(schema.transfer);

    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      migrations,
      data: {
        users,
        categories,
        types,
        wallet: wallets,
        transactions,
        transfer: transfers,
      },
    };
    file.write(JSON.stringify(exportData, null));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        dialogTitle: "Export",
        UTI: "public.json",
      });
    }

    return {
      success: true,
      message: `File export success ${fileName}`,
      filePath: file.uri,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error exporting file: ${error.message}`,
    };
  } finally {
    try {
      file.delete();
    } catch (deleteError) {
      console.log("Error deleting file");
    }
  }
}

export async function importDatabase(): Promise<{ success: boolean; message: string }> {
  let tempFile: File | null = null;

  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return {
        success: false,
        message: "Import canceled",
      };
    }

    tempFile = new File(result.assets[0].uri);
    const fileContent = await tempFile.text();

    const importData: ExportData = JSON.parse(fileContent);

    if (!importData.migrations || !importData.data) {
      return {
        success: false,
        message: "Invalid backup file format",
      };
    }

    const expoDb = openDatabaseSync(DB_NAME);
    const db = drizzle(expoDb, { schema });

    const currentMigrations = await getCurrentMigrations(expoDb);

    const validation = validateImportedDatabase(currentMigrations, importData.migrations);

    if (!validation.isValid) {
      return {
        success: false,
        message: validation.error || "Validation failed",
      };
    }

    await expoDb.execAsync("BEGIN TRANSACTION");

    try {
      // Delete all existing data (in reverse order due to foreign keys)
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
      if (importData.data.transactions.length > 0) {
        await db.insert(schema.transactions).values(importData.data.transactions);
      }
      if (importData.data.transfer.length > 0) {
        await db.insert(schema.transfer).values(importData.data.transfer);
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

      // Commit transaction
      await expoDb.execAsync("COMMIT");

      return {
        success: true,
        message:
          "Database imported successfully!\nPlease restart the app to see your updated data.",
      };
    } catch (error) {
      await expoDb.execAsync("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Import error:", error);
    return {
      success: false,
      message: `Import error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  } finally {
    // Delete temporary file
    if (tempFile) {
      try {
        tempFile.delete();
      } catch (deleteError) {
        console.log("Temporary file already deleted");
      }
    }
  }
}

export async function deleteAllData(): Promise<{ success: boolean; message: string }> {
  try {
    const expoDb = openDatabaseSync(DB_NAME);

    await expoDb.execAsync("BEGIN TRANSACTION");

    try {
      // Drop all user tables (in reverse order due to foreign keys)
      await expoDb.execAsync(`
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
        message:
          "All data deleted successfully!\nPlease restart the app to reinitialize the database.",
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
  }
}
