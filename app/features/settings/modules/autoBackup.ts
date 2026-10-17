import { Directory, File, Paths } from "expo-file-system";
import { defaultDatabaseDirectory, openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { expoDb } from "db";
import {
  DB_NAME,
  closeQuietly,
  copyDatabase,
  deleteQuietly,
  isDatabaseReadable,
  verifyDatabaseIntegrity,
} from "./databaseFile";

export type AutoBackup = { uri: string; name: string; savedAt: number | null };

export type AutoBackupStatus = {
  latest: AutoBackup | null;
  previous: AutoBackup | null;
  // No backup has landed for a while: something keeps failing.
  isStuck: boolean;
  isLowOnStorage: boolean;
};

const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
const STUCK_AFTER_MS = 3 * BACKUP_INTERVAL_MS;

const LATEST_NAME = "SpendyFly_autobackup.db";
const PREVIOUS_NAME = "SpendyFly_autobackup_prev.db";
const TEMP_NAME = "SpendyFly_autobackup.tmp.db";

// Built on every call: iOS moves the app container on updates and restores.
const backupDirectory = () => new Directory(Paths.document, "autobackup");
const backupFile = (name: string) => new File(backupDirectory(), name);

const deleteWithSidecars = (name: string) => {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    deleteQuietly(backupFile(`${name}${suffix}`));
  }
};

const toAutoBackup = (file: File): AutoBackup | null =>
  file.exists ? { uri: file.uri, name: file.name, savedAt: file.lastModified ?? null } : null;

const liveDatabaseSize = () => {
  if (!defaultDatabaseDirectory) return 0;

  let size = 0;
  for (const suffix of ["", "-wal"]) {
    const file = new File(`file://${defaultDatabaseDirectory}/${DB_NAME}${suffix}`);
    if (file.exists) size += file.size ?? 0;
  }

  return size;
};

// Room for the temporary copy plus some headroom for SQLite.
const isLowOnStorage = () => {
  try {
    return Paths.availableDiskSpace < liveDatabaseSize() * 2;
  } catch (error) {
    console.warn("Could not read the free storage space", error);
    return false;
  }
};

const hasTransactions = async (database: SQLiteDatabase) => {
  if (!(await isDatabaseReadable(database))) return false;

  try {
    return (await database.getFirstAsync("SELECT 1 FROM Transactions LIMIT 1;")) !== null;
  } catch (error) {
    return false;
  }
};

const isDue = (latest: File) => {
  if (!latest.exists) return true;

  const savedAt = latest.lastModified;
  return savedAt == null || Date.now() - savedAt >= BACKUP_INTERVAL_MS;
};

const writeBackup = async (source: SQLiteDatabase) => {
  let copy: SQLiteDatabase | null = null;

  try {
    copy = await openDatabaseAsync(TEMP_NAME, {}, backupDirectory().uri);
    await copyDatabase(source, copy);
    await verifyDatabaseIntegrity(copy);
    // Closing folds the copy's WAL into the file before it is moved.
    await copy.closeAsync();
    copy = null;

    const latest = backupFile(LATEST_NAME);
    if (latest.exists) {
      deleteWithSidecars(PREVIOUS_NAME);
      await latest.move(backupFile(PREVIOUS_NAME));
    }

    await backupFile(TEMP_NAME).move(backupFile(LATEST_NAME));
  } finally {
    await closeQuietly(copy);
    deleteWithSidecars(TEMP_NAME);
  }
};

const backUpIfDue = async () => {
  try {
    if (!expoDb) return;

    backupDirectory().create({ intermediates: true, idempotent: true });
    // Left behind if the app was killed mid-write.
    deleteWithSidecars(TEMP_NAME);

    if (!isDue(backupFile(LATEST_NAME))) return;
    if (isLowOnStorage()) return;
    // An empty database must never push good backups out.
    if (!(await hasTransactions(expoDb))) return;

    await writeBackup(expoDb);
  } catch (error) {
    console.warn("Automatic backup failed", error);
  }
};

let inFlight: Promise<void> | null = null;

/** Backs up at most once a day. Failures are logged and retried next check. */
export const runAutoBackupIfDue = () => {
  inFlight ??= backUpIfDue().finally(() => {
    inFlight = null;
  });

  return inFlight;
};

/** Lists auto backups without touching the live database, so the recovery screen can use it. */
export const getAutoBackups = () => ({
  latest: toAutoBackup(backupFile(LATEST_NAME)),
  previous: toAutoBackup(backupFile(PREVIOUS_NAME)),
});

export const getAutoBackupStatus = async (): Promise<AutoBackupStatus> => {
  const { latest, previous } = getAutoBackups();
  let isStuck = false;

  if (expoDb && (await hasTransactions(expoDb))) {
    isStuck = latest?.savedAt == null || Date.now() - latest.savedAt > STUCK_AFTER_MS;
  }

  return { latest, previous, isStuck, isLowOnStorage: isStuck && isLowOnStorage() };
};

export const deleteAutoBackups = () => {
  try {
    const directory = backupDirectory();
    if (directory.exists) directory.delete();
  } catch (error) {
    console.warn("Could not delete the automatic backups", error);
  }
};
