import * as DocumentPicker from "expo-document-picker";
import { Directory, File, FileMode, Paths, type FileHandle } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import {
  backupDatabaseAsync,
  defaultDatabaseDirectory,
  deleteDatabaseAsync,
  openDatabaseAsync,
  type SQLiteDatabase,
} from "expo-sqlite";
import { expoDb } from "db";
import * as schema from "db/schema";
import migrations from "drizzle/migrations";

export type DatabaseFileResult = {
  success: boolean;
  canceled?: boolean;
  message: string;
};

export const DB_NAME = "db.db";

// Android reports .db and .json as octet-stream, so files are checked by content instead.
export const ANY_FILE_TYPE = "*/*";
const SNAPSHOT_MIME_TYPE = "application/octet-stream";

export const WORKING_FILE_PREFIX = "spendyfly_";

// Case-insensitive, so it also matches the user-facing `SpendyFly_backup_…` files.
const WORKING_FILE_MATCH = "spendyfly";

// Present since the first migration. Checked before migrate(), which would
// otherwise build an empty schema inside any SQLite file.
const REQUIRED_TABLES = ["__drizzle_migrations", "Users", "Wallet", "Categories", "Transactions"];

/** An error whose message is safe to show the user as-is. */
export class DatabaseFileError extends Error {
  /** False when the live database may have been changed. */
  readonly dataIntact: boolean;

  constructor(message: string, dataIntact = true) {
    super(message);
    this.dataIntact = dataIntact;
  }
}

export const describeRestoreFailure = (error: unknown, fallback: string) => {
  if (error instanceof DatabaseFileError) {
    return error.dataIntact
      ? `${error.message} Your existing data was not replaced.`
      : error.message;
  }

  return `${fallback} Your existing data was not replaced.`;
};

export const createTimestamp = () => new Date().toISOString().replace(/[:.]/g, "-");

// Minute resolution can repeat, so callers delete the target before writing to it.
export const createBackupFileName = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  return `SpendyFly_backup_${date}_${pad(now.getHours())}${pad(now.getMinutes())}.db`;
};

// The latest commits can live only in the WAL, so it must travel with the file.
const walFileFor = (file: File) => new File(`${file.uri}-wal`);

// Followed by a NUL byte, checked separately so git doesn't treat this file as binary.
const SQLITE_MAGIC = "SQLite format 3";

export type PickedBackup = { uri: string; name: string | null };

export const pickBackupFile = async (): Promise<PickedBackup | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ANY_FILE_TYPE,
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  return { uri: result.assets[0].uri, name: result.assets[0].name ?? null };
};

export const isSqliteFile = (file: File) => {
  let handle: FileHandle | null = null;

  try {
    // Read-only: the default read-write fails on files we can't write to.
    handle = file.open(FileMode.ReadOnly);
    const header = handle.readBytes(SQLITE_MAGIC.length + 1);

    return (
      String.fromCharCode(...header.subarray(0, SQLITE_MAGIC.length)) === SQLITE_MAGIC &&
      header[SQLITE_MAGIC.length] === 0
    );
  } catch (error) {
    console.warn("Could not read the file header", error);

    return false;
  } finally {
    handle?.close();
  }
};

export const closeQuietly = async (database: SQLiteDatabase | null) => {
  if (!database) return;

  try {
    await database.closeAsync();
  } catch (error) {
    console.warn("Failed to close a temporary database", error);
  }
};

export const deleteQuietly = (file: File | null) => {
  if (!file?.exists) return;

  try {
    file.delete();
  } catch (error) {
    console.warn("Failed to remove a temporary file", error);
  }
};

/** Removes working files earlier runs left in the cache, except `keepNames`. */
export const purgeStaleWorkingFiles = (...keepNames: string[]) => {
  const keep = new Set(keepNames);

  try {
    for (const entry of new Directory(Paths.cache).list()) {
      if (!(entry instanceof File)) continue;
      if (!entry.name.toLowerCase().startsWith(WORKING_FILE_MATCH)) continue;
      if (keep.has(entry.name)) continue;
      deleteQuietly(entry);
    }
  } catch (error) {
    console.warn("Failed to purge stale backup working files", error);
  }
};

export const verifyDatabaseIntegrity = async (database: SQLiteDatabase) => {
  const integrity = await database.getFirstAsync<{ integrity_check: string }>(
    "PRAGMA integrity_check;",
  );

  if (integrity?.integrity_check !== "ok") {
    throw new DatabaseFileError("That file is damaged, so SpendyFly cannot open it.");
  }

  const foreignKeyErrors = await database.getAllAsync("PRAGMA foreign_key_check;");
  if (foreignKeyErrors.length > 0) {
    throw new DatabaseFileError(
      "Some records in that file are broken, so SpendyFly cannot open it.",
    );
  }
};

// A handle opens fine over a corrupted file; only the first query fails.
export const isDatabaseReadable = async (database: SQLiteDatabase) => {
  try {
    await database.getFirstAsync("SELECT 1 FROM sqlite_master LIMIT 1;");
    return true;
  } catch (error) {
    return false;
  }
};

const readPragmaNumber = async (
  database: SQLiteDatabase,
  pragma: "user_version" | "page_count",
) => {
  const row = await database.getFirstAsync<Record<string, unknown>>(`PRAGMA ${pragma};`);
  const value = row?.[pragma];

  return typeof value === "number" ? value : null;
};

/**
 * Copies `source` over `destination` and checks the pages actually moved:
 * `backupDatabaseAsync` can resolve without copying when the destination is
 * locked. A `user_version` marker must be overwritten by the copy to count.
 */
export const copyDatabase = async (source: SQLiteDatabase, destination: SQLiteDatabase) => {
  const sourceVersion = await readPragmaNumber(source, "user_version");
  let markerWritten = false;

  if (sourceVersion !== null) {
    try {
      await destination.execAsync(`PRAGMA user_version = ${sourceVersion + 1};`);
      markerWritten = true;
    } catch (error) {
      console.warn("Could not mark the destination database before copying", error);
    }
  }

  await backupDatabaseAsync({
    sourceDatabase: source,
    destDatabase: destination,
  });

  const copied = markerWritten
    ? (await readPragmaNumber(destination, "user_version")) === sourceVersion
    : await pageCountsMatch(source, destination);

  if (!copied) {
    throw new DatabaseFileError(
      "The database could not be copied because it is still in use. Close and reopen SpendyFly, then try again.",
    );
  }
};

const pageCountsMatch = async (source: SQLiteDatabase, destination: SQLiteDatabase) => {
  const sourcePages = await readPragmaNumber(source, "page_count");
  const destinationPages = await readPragmaNumber(destination, "page_count");

  return sourcePages !== null && sourcePages === destinationPages;
};

// Reuses the app's handle: opening db.db again creates a separate connection that locks copies.
export const openLiveDatabase = async (): Promise<{
  database: SQLiteDatabase;
  release: () => Promise<void>;
}> => {
  if (expoDb) return { database: expoDb, release: async () => {} };

  const database = await openDatabaseAsync(DB_NAME);
  await database.execAsync("PRAGMA foreign_keys = ON;");

  return { database, release: () => closeQuietly(database) };
};

const assertSpendyFlyDatabase = async (database: SQLiteDatabase) => {
  let tables: Set<string>;

  try {
    const rows = await database.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table';",
    );
    tables = new Set(rows.map((row) => row.name));
  } catch (error) {
    throw new DatabaseFileError("That file is not a database file.");
  }

  const missing = REQUIRED_TABLES.filter((table) => !tables.has(table));
  if (missing.length > 0) {
    console.warn("Rejected a database file, missing tables:", missing.join(", "));
    throw new DatabaseFileError("That file is not a SpendyFly backup.");
  }
};

// migrate() only moves forward, so it would accept a schema newer than this build.
const assertNotFromNewerVersion = async (database: SQLiteDatabase) => {
  const knownTimestamps = migrations.journal.entries.map((entry) => entry.when);
  if (knownTimestamps.length === 0) return;

  const newestKnown = Math.max(...knownTimestamps);
  const row = await database.getFirstAsync<{ newest: number | null }>(
    "SELECT max(created_at) AS newest FROM __drizzle_migrations;",
  );
  const newestInFile = Number(row?.newest ?? 0);

  if (newestInFile > newestKnown) {
    throw new DatabaseFileError(
      "That backup was made with a newer version of SpendyFly. Please update the app, then try again.",
    );
  }
};

const removeLiveDatabaseFiles = async () => {
  try {
    await deleteDatabaseAsync(DB_NAME);
  } catch (error) {
    console.warn("deleteDatabaseAsync failed, removing the file directly", error);
  }

  if (!defaultDatabaseDirectory) return;

  // Always run: deleteDatabaseAsync leaves the sidecars, and a stale -wal would be replayed.
  try {
    for (const suffix of ["", "-journal", "-wal", "-shm"]) {
      deleteQuietly(new File(`file://${defaultDatabaseDirectory}/${DB_NAME}${suffix}`));
    }
  } catch (error) {
    console.warn("Failed to remove database sidecar files", error);
  }
};

export const SET_ASIDE_DB_NAME = `${DB_NAME}.broken`;

/** Moves the current database aside (not deleted) so the next launch starts empty. */
export const startOverWithFreshDatabase = async (): Promise<DatabaseFileResult> => {
  if (!defaultDatabaseDirectory) {
    return {
      success: false,
      message: "SpendyFly could not find where your data is stored.",
    };
  }

  const liveFile = new File(`file://${defaultDatabaseDirectory}/${DB_NAME}`);
  const setAsideFile = new File(`file://${defaultDatabaseDirectory}/${SET_ASIDE_DB_NAME}`);

  try {
    if (liveFile.exists) {
      // Taken before the move: `move()` repoints `liveFile` at its new location.
      const liveWal = walFileFor(liveFile);
      const setAsideWal = walFileFor(setAsideFile);

      deleteQuietly(setAsideFile);
      deleteQuietly(setAsideWal);
      await liveFile.move(setAsideFile);

      if (liveWal.exists) await liveWal.move(setAsideWal);
    }

    for (const suffix of ["-journal", "-wal", "-shm"]) {
      deleteQuietly(new File(`file://${defaultDatabaseDirectory}/${DB_NAME}${suffix}`));
    }

    return {
      success: true,
      message: "Starting fresh. Restarting SpendyFly…",
    };
  } catch (error) {
    console.error("Failed to start over with a fresh database", error);

    return {
      success: false,
      message: "SpendyFly could not put your old data aside. Please try again.",
    };
  }
};

/**
 * Makes `source` the live database: copies pages into `expoDb` when it is
 * usable, otherwise replaces the file. The caller must restart the app after.
 */
export const installDatabase = async (
  source: SQLiteDatabase,
  successMessage: string,
): Promise<DatabaseFileResult> => {
  if (!expoDb || !(await isDatabaseReadable(expoDb))) {
    return installByReplacingFile(source, successMessage);
  }

  const safetyName = `${WORKING_FILE_PREFIX}before_restore_${createTimestamp()}.db`;
  const safetyFile = new File(Paths.cache, safetyName);
  let safetyDatabase: SQLiteDatabase | null = null;

  try {
    // Best-effort rollback snapshot.
    try {
      safetyDatabase = await openDatabaseAsync(safetyName, {}, Paths.cache.uri);
      await copyDatabase(expoDb, safetyDatabase);
    } catch (safetyError) {
      console.warn("Could not snapshot the current database before restoring", safetyError);
      await closeQuietly(safetyDatabase);
      safetyDatabase = null;
    }

    await copyDatabase(source, expoDb);
    await verifyDatabaseIntegrity(expoDb);

    return { success: true, message: successMessage };
  } catch (error) {
    let rolledBack = false;

    if (safetyDatabase) {
      try {
        await copyDatabase(safetyDatabase, expoDb);
        rolledBack = true;
      } catch (rollbackError) {
        console.error("Failed to roll back the restore", rollbackError);
      }
    }

    if (rolledBack) throw error;

    throw new DatabaseFileError(
      "Something went wrong partway through, so the data on this phone may be incomplete. Load a backup file to put it right.",
      false,
    );
  } finally {
    await closeQuietly(safetyDatabase);
    deleteQuietly(safetyFile);
  }
};

const installByReplacingFile = async (
  source: SQLiteDatabase,
  successMessage: string,
): Promise<DatabaseFileResult> => {
  let target: SQLiteDatabase | null = null;

  try {
    target = await openReplaceableTarget();
    await copyDatabase(source, target);
    await verifyDatabaseIntegrity(target);

    return { success: true, message: successMessage };
  } finally {
    await closeQuietly(target);
  }
};

// Reuses a readable live file; an unreadable one is deleted and recreated.
const openReplaceableTarget = async (): Promise<SQLiteDatabase> => {
  try {
    const existing = await openDatabaseAsync(DB_NAME);
    if (await isDatabaseReadable(existing)) return existing;

    console.warn("The live database opened but could not be read, replacing the file");
    await closeQuietly(existing);
  } catch (openError) {
    console.warn("Could not open the live database, replacing the file", openError);
  }

  await removeLiveDatabaseFiles();

  return await openDatabaseAsync(DB_NAME);
};

// Opening and closing checkpoints the -wal beside the copy into the main file.
const foldWalIntoCopy = async (fileName: string) => {
  let copy: SQLiteDatabase | null = null;

  try {
    copy = await openDatabaseAsync(fileName, {}, Paths.cache.uri);
    await isDatabaseReadable(copy);
  } catch (error) {
    console.warn("Could not fold the WAL into the copied database", error);
  } finally {
    await closeQuietly(copy);
  }
};

export const shareSnapshot = (file: File) =>
  Sharing.shareAsync(file.uri, {
    dialogTitle: "Save your SpendyFly data",
    mimeType: SNAPSHOT_MIME_TYPE,
    UTI: "public.database",
  });

// Includes the set-aside file so data from "Start fresh" can still be saved.
const findSavableFile = () => {
  if (!defaultDatabaseDirectory) return null;

  for (const name of [DB_NAME, SET_ASIDE_DB_NAME]) {
    const file = new File(`file://${defaultDatabaseDirectory}/${name}`);
    if (file.exists) return file;
  }

  return null;
};

/** Copies the raw database file, for when it can't be opened or read. */
const snapshotByCopyingFile = async (fileName: string): Promise<DatabaseFileResult> => {
  const liveFile = findSavableFile();

  if (!liveFile) {
    return {
      success: false,
      message: "There is no data on this device to save.",
    };
  }

  const snapshotFile = new File(Paths.cache, fileName);
  const snapshotWal = walFileFor(snapshotFile);
  deleteQuietly(snapshotFile);
  deleteQuietly(snapshotWal);

  try {
    await liveFile.copy(snapshotFile);

    const liveWal = walFileFor(liveFile);
    if (liveWal.exists) await liveWal.copy(snapshotWal);

    await foldWalIntoCopy(fileName);
    await shareSnapshot(snapshotFile);

    return { success: true, message: "" };
  } catch (error) {
    console.error("Failed to copy the database file", error);
    deleteQuietly(snapshotFile);
    deleteQuietly(snapshotWal);

    return { success: false, message: "Your data could not be copied." };
  }
};

/** Copies the live database to a .db file and opens the share sheet. */
export const createDatabaseSnapshot = async (): Promise<DatabaseFileResult> => {
  const fileName = createBackupFileName();
  const snapshotFile = new File(Paths.cache, fileName);
  let snapshotDatabase: SQLiteDatabase | null = null;

  try {
    if (!(await Sharing.isAvailableAsync())) {
      return {
        success: false,
        message: "Sharing files is not available on this device.",
      };
    }

    purgeStaleWorkingFiles(fileName);

    if (!expoDb) return await snapshotByCopyingFile(fileName);

    try {
      deleteQuietly(snapshotFile);
      snapshotDatabase = await openDatabaseAsync(fileName, {}, Paths.cache.uri);
      await copyDatabase(expoDb, snapshotDatabase);
      await verifyDatabaseIntegrity(snapshotDatabase);
      await snapshotDatabase.closeAsync();
      snapshotDatabase = null;
    } catch (backupError) {
      console.warn("Could not copy pages out of the database, copying the file", backupError);
      await closeQuietly(snapshotDatabase);
      snapshotDatabase = null;
      deleteQuietly(snapshotFile);

      return await snapshotByCopyingFile(fileName);
    }

    await shareSnapshot(snapshotFile);

    // Not deleted here: the receiving app may still be reading it. Purged on the next run.
    return { success: true, message: "" };
  } catch (error) {
    console.error("Failed to create a database snapshot", error);
    deleteQuietly(snapshotFile);

    return {
      success: false,
      message:
        error instanceof DatabaseFileError
          ? error.message
          : "The copy could not be made. Your existing data was not changed.",
    };
  } finally {
    await closeQuietly(snapshotDatabase);
  }
};

/** Restores a .db backup from a cache copy, upgrading older ones to the current schema. */
export const restoreDatabaseSnapshot = async (
  picked?: PickedBackup,
): Promise<DatabaseFileResult> => {
  const candidateName = `${WORKING_FILE_PREFIX}restore_${createTimestamp()}.db`;
  const candidateFile = new File(Paths.cache, candidateName);
  let candidateDatabase: SQLiteDatabase | null = null;

  try {
    const source = picked ?? (await pickBackupFile());

    if (!source) {
      return { success: false, canceled: true, message: "Restore canceled." };
    }

    // The source may itself be in the cache, so spare it from the purge.
    const sourceFile = new File(source.uri);
    purgeStaleWorkingFiles(candidateName, sourceFile.name);
    deleteQuietly(candidateFile);
    await sourceFile.copy(candidateFile);

    candidateDatabase = await openDatabaseAsync(candidateName, {}, Paths.cache.uri);
    await assertSpendyFlyDatabase(candidateDatabase);
    await assertNotFromNewerVersion(candidateDatabase);
    await migrate(drizzle(candidateDatabase, { schema }), migrations);
    await verifyDatabaseIntegrity(candidateDatabase);

    return await installDatabase(candidateDatabase, "Your data was restored.");
  } catch (error) {
    console.error("Failed to restore a database snapshot", error);

    return {
      success: false,
      message: describeRestoreFailure(error, "SpendyFly could not load that file."),
    };
  } finally {
    await closeQuietly(candidateDatabase);
    deleteQuietly(candidateFile);
  }
};
