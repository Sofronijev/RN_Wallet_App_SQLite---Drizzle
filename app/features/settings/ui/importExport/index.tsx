import React, { useCallback, useState } from "react";
import { View, Alert, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { importBackup, deleteAllData } from "../../modules/exportImport";
import {
  createDatabaseSnapshot,
  restoreDatabaseSnapshot,
  type DatabaseFileResult,
} from "../../modules/databaseFile";
import {
  getAutoBackupStatus,
  runAutoBackupIfDue,
  type AutoBackup,
  type AutoBackupStatus,
} from "../../modules/autoBackup";
import { formatBackupDate } from "modules/timeAndDate";
import ShadowBoxView from "components/ShadowBoxView";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import CustomButton from "components/CustomButton";
import { restartApp } from "modules/restartApp";

type BackupAction = "export" | "import" | "delete" | "restoreLatest" | "restorePrevious" | "retry";

export const DatabaseBackupScreen = () => {
  const [activeAction, setActiveAction] = useState<BackupAction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [autoBackups, setAutoBackups] = useState<AutoBackupStatus | null>(null);

  const loadAutoBackups = useCallback(() => {
    getAutoBackupStatus()
      .then(setAutoBackups)
      .catch((error) => console.warn("Could not read the automatic backups", error));
  }, []);

  // Files can change while the screen is away, so re-read on every visit.
  useFocusEffect(loadAutoBackups);

  const styles = useThemedStyles(themedStyles);
  const isBusy = activeAction !== null || isDeleting;

  const runExport = async (action: BackupAction, run: () => Promise<DatabaseFileResult>) => {
    setActiveAction(action);
    try {
      const result = await run();

      if (!result.success) {
        Alert.alert("Error", result.message, [{ text: "OK" }]);
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred during export.", [{ text: "OK" }]);
    } finally {
      setActiveAction(null);
    }
  };

  const runImport = async (action: BackupAction, run: () => Promise<DatabaseFileResult>) => {
    setActiveAction(action);
    try {
      const result = await run();

      if (result.canceled) return;

      if (result.success) {
        promptRestart(result.message);
      } else {
        Alert.alert("Error", result.message, [{ text: "OK" }]);
      }
    } catch (error) {
      Alert.alert("Error", "Unexpected error during import", [{ text: "OK" }]);
    } finally {
      setActiveAction(null);
    }
  };

  const promptRestart = (message: string) =>
    Alert.alert("Done", `${message}\n\nSpendyFly needs to restart before you can see it.`, [
      { text: "Later", style: "cancel" },
      {
        text: "Restart now",
        onPress: () => {
          restartApp().catch((error) => {
            console.error("Failed to restart SpendyFly", error);
            Alert.alert("Error", "Please close and reopen SpendyFly to see your data.", [
              { text: "OK" },
            ]);
          });
        },
      },
    ]);

  const confirmImport = () =>
    Alert.alert(
      "Replace everything?",
      "This replaces every transaction, wallet and category on this phone with what is in the backup file you choose.\n\nSave a backup first if you might still need what is in the app now.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Choose file",
          style: "destructive",
          onPress: () => runImport("import", importBackup),
        },
      ],
    );

  const confirmAutoRestore = (action: BackupAction, backup: AutoBackup) => {
    const savedAt = backup.savedAt ? ` from ${formatBackupDate(backup.savedAt)}` : "";

    Alert.alert(
      "Restore automatic backup?",
      `This replaces every transaction, wallet and category on this phone with the automatic backup${savedAt}.\n\nAnything added since then will be lost.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: () =>
            runImport(action, () => restoreDatabaseSnapshot({ uri: backup.uri, name: backup.name })),
        },
      ],
    );
  };

  const retryAutoBackup = async () => {
    setActiveAction("retry");
    try {
      await runAutoBackupIfDue();
      loadAutoBackups();
    } finally {
      setActiveAction(null);
    }
  };

  const renderAutoBackupRow = (label: string, action: BackupAction, backup: AutoBackup | null) =>
    backup && (
      <View style={styles.autoBackupRow}>
        <View style={styles.autoBackupInfo}>
          <Label style={styles.autoBackupLabel}>{label}</Label>
          <Label style={styles.autoBackupDate}>
            {backup.savedAt ? formatBackupDate(backup.savedAt) : "Unknown date"}
          </Label>
        </View>
        <CustomButton
          onPress={() => confirmAutoRestore(action, backup)}
          disabled={isBusy}
          title='Restore'
          isLoading={activeAction === action}
          type='danger'
          size='small'
          outline
        />
      </View>
    );

  const stuckMessage = () => {
    if (autoBackups?.isLowOnStorage) {
      return "Your phone is almost out of storage, so automatic backup can't run. Free up some space, then tap Try Again.";
    }
    const savedAt = autoBackups?.latest?.savedAt;
    return savedAt
      ? `Automatic backup hasn't worked since ${formatBackupDate(savedAt)}. Use Save Backup to keep a copy.`
      : "Automatic backup hasn't worked yet. Use Save Backup to keep a copy.";
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      "Delete everything?",
      "This deletes every transaction, wallet and category on this phone, along with the automatic backups. It cannot be undone.\n\nSave a backup first if you might want any of it back.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const result = await deleteAllData();

              if (result.success) {
                promptRestart(result.message);
              } else {
                Alert.alert("Error", result.message, [{ text: "OK" }]);
              }
            } catch (error) {
              Alert.alert("Error", "Unexpected error during deletion", [{ text: "OK" }]);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ShadowBoxView style={styles.section}>
        <Label style={styles.sectionTitle}>Automatic Backup</Label>
        <Label style={styles.description}>
          SpendyFly saves a copy of your data on this phone once a day and keeps the last two
          copies. Use it if something goes wrong, like deleting data by mistake.
          It stays on this phone, so to keep your data safe if you lose or change phones, use Save
          Backup.
        </Label>
        {autoBackups?.isStuck && (
          <View style={styles.stuckBox}>
            <Label style={styles.warning}>⚠️ {stuckMessage()}</Label>
            <CustomButton
              onPress={retryAutoBackup}
              disabled={isBusy}
              title='Try Again'
              isLoading={activeAction === "retry"}
              size='small'
              outline
            />
          </View>
        )}
        {autoBackups && !autoBackups.latest && !autoBackups.previous && (
          <Label style={styles.autoBackupDate}>No automatic backup yet.</Label>
        )}
        {renderAutoBackupRow("Latest", "restoreLatest", autoBackups?.latest ?? null)}
        {renderAutoBackupRow("Previous", "restorePrevious", autoBackups?.previous ?? null)}
      </ShadowBoxView>

      <ShadowBoxView style={styles.section}>
        <Label style={styles.sectionTitle}>Save A Backup</Label>
        <Label style={styles.description}>
          Creates a backup file of all your data that you can save or share.
        </Label>
        <CustomButton
          onPress={() => runExport("export", createDatabaseSnapshot)}
          disabled={isBusy}
          title='Save Backup'
          isLoading={activeAction === "export"}
          type='primary'
          size='small'
        />
      </ShadowBoxView>

      <ShadowBoxView style={styles.section}>
        <Label style={styles.sectionTitle}>Load A Backup</Label>
        <Label style={styles.description}>Loads a backup file and replaces all current data.</Label>
        <Label style={styles.warning}>⚠️ This will delete all your current data!</Label>
        <CustomButton
          onPress={confirmImport}
          disabled={isBusy}
          title='Load Backup'
          isLoading={activeAction === "import"}
          type='danger'
          size='small'
        />
      </ShadowBoxView>

      <ShadowBoxView style={styles.section}>
        <Label style={styles.sectionTitle}>Delete All Data</Label>
        <Label style={styles.description}>Permanently deletes all your data from the app.</Label>
        <Label style={styles.warning}>
          ⚠️ This action cannot be undone! Create a backup first.
        </Label>
        <CustomButton
          onPress={handleDeleteAllData}
          disabled={isBusy}
          title='Delete All Data'
          isLoading={isDeleting}
          type='danger'
          size='small'
        />
      </ShadowBoxView>

      <View style={styles.info}>
        <Label style={styles.infoTitle}>ℹ️ Good to know:</Label>
        <Label style={styles.infoText}>
          • Backups from older versions of SpendyFly still work, and are brought up to date for you
        </Label>
        <Label style={styles.infoText}>
          • A backup from a newer version of SpendyFly cannot be loaded. Update the app first
        </Label>
        <Label style={styles.infoText}>
          • Always save a backup before loading one or deleting your data
        </Label>
        <Label style={styles.infoText}>
          • Switching phones? Save a backup and load it on the new phone
        </Label>
      </View>
    </ScrollView>
  );
};

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    section: {
      padding: 16,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 10,
    },
    description: {
      fontSize: 14,
      color: theme.colors.muted,
      marginBottom: 15,
    },
    warning: {
      fontSize: 14,
      color: theme.colors.redDark,
      marginBottom: 15,
      fontWeight: "500",
    },
    stuckBox: {
      marginBottom: 15,
      alignItems: "flex-start",
    },
    autoBackupRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
    },
    autoBackupInfo: {
      flexShrink: 1,
      marginRight: 12,
    },
    autoBackupLabel: {
      fontSize: 15,
      fontWeight: "600",
    },
    autoBackupDate: {
      fontSize: 14,
      color: theme.colors.muted,
    },
    info: {
      backgroundColor: theme.colors.info,
      borderRadius: 10,
      padding: 15,
      marginTop: 10,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 10,
    },
    infoText: {
      fontSize: 13,
      color: theme.colors.grey,
      marginBottom: 5,
      lineHeight: 18,
    },
  });
