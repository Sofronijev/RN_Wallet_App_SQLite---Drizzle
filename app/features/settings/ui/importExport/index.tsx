import React, { useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { exportDatabase, importDatabase, deleteAllData } from "../../modules/exportImport";
import ShadowBoxView from "components/ShadowBoxView";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import colors from "constants/colors";
import CustomButton from "components/CustomButton";

export const DatabaseBackupScreen = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const styles = useThemedStyles(themedStyles);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportDatabase();

      if (!result.success) {
        Alert.alert("Error", result.message, [{ text: "OK" }]);
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred during export.", [{ text: "OK" }]);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const result = await importDatabase();

      if (result.message !== "Import canceled") {
        if (result.success) {
          Alert.alert("Success", result.message, [], { cancelable: false });
        } else {
          Alert.alert("Error", result.message, [{ text: "OK" }]);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Unexpected error during import", [{ text: "OK" }]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      "Delete All Data",
      "Are you sure you want to delete all your data? This action cannot be undone!\n\nConsider creating a backup first.",
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
                Alert.alert("Success", result.message, [], { cancelable: false });
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
    <View style={styles.container}>
      <ShadowBoxView style={styles.section}>
        <Label style={styles.sectionTitle}>Export Database</Label>
        <Label style={styles.description}>
          Creates a backup file of all your data that you can save or share.
        </Label>
        <CustomButton
          onPress={handleExport}
          disabled={isExporting}
          title='Export'
          isLoading={isExporting}
          type='primary'
          size='small'
        />
      </ShadowBoxView>

      <ShadowBoxView style={styles.section}>
        <Label style={styles.sectionTitle}>Import Database</Label>
        <Label style={styles.description}>Loads a backup file and replaces all current data.</Label>
        <Label style={styles.warning}>⚠️ This will delete all your current data!</Label>
        <CustomButton
          onPress={handleImport}
          disabled={isImporting}
          title='Import'
          isLoading={isImporting}
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
          disabled={isDeleting}
          title='Delete All Data'
          isLoading={isDeleting}
          type='danger'
          size='small'
        />
      </ShadowBoxView>

      <View style={styles.info}>
        <Label style={styles.infoTitle}>ℹ️ Notes:</Label>
        <Label style={styles.infoText}>
          • Backup files are automatically checked for compatibility
        </Label>
        <Label style={styles.infoText}>
          • Older backups will be automatically updated to the latest version
        </Label>
        <Label style={styles.infoText}>• You cannot import backups from a newer app version</Label>
        <Label style={styles.infoText}>
          • Always create a backup before deleting or importing data
        </Label>
      </View>
    </View>
  );
};

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
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
    button: {
      padding: 8,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    exportButton: {
      backgroundColor: theme.colors.primary,
    },
    importButton: {
      backgroundColor: theme.colors.danger,
    },
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
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
