import React, { useState } from "react";
import { View, Alert, StyleSheet, ScrollView } from "react-native";
import { importBackup, deleteAllData } from "../../modules/exportImport";
import { createDatabaseSnapshot, type DatabaseFileResult } from "../../modules/databaseFile";
import ShadowBoxView from "components/ShadowBoxView";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import CustomButton from "components/CustomButton";
import { restartApp } from "modules/restartApp";

type BackupAction = "export" | "import" | "delete";

export const DatabaseBackupScreen = () => {
  const [activeAction, setActiveAction] = useState<BackupAction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAllData = () => {
    Alert.alert(
      "Delete everything?",
      "This deletes every transaction, wallet and category on this phone. It cannot be undone.\n\nSave a backup first if you might want any of it back.",
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
