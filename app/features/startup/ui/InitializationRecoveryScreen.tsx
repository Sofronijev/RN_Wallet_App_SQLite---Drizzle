import React, { useRef, useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Feather from "@react-native-vector-icons/feather/static";
import CustomButton from "components/CustomButton";
import { useAppTheme } from "app/theme/ThemeContext";
import {
  createDatabaseSnapshot as saveRecoveryDatabase,
  startOverWithFreshDatabase as startOverWithEmptyDatabase,
  type DatabaseFileResult as RecoveryActionResult,
} from "app/features/settings/modules/databaseFile";
import { importBackup as restoreRecoveryBackup } from "app/features/settings/modules/exportImport";

type RecoveryAction = "retry" | "saveCopy" | "restore" | "startOver" | "support";

const SUPPORT_EMAIL = "spendyfly+support@gmail.com";

// Migrations roll back on failure, so the data is intact: no destructive options.
const MIGRATION_ERROR_CODE = "INIT-DB-002";

type InitializationRecoveryScreenProps = {
  onRetry: () => Promise<void>;
  errorCode: string;
  errorDetail?: string;
};

const InitializationRecoveryScreen: React.FC<InitializationRecoveryScreenProps> = ({
  onRetry,
  errorCode,
  errorDetail,
}) => {
  const { theme } = useAppTheme();
  const [activeAction, setActiveAction] = useState<RecoveryAction | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hasActionError, setHasActionError] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const styles = createStyles(theme);
  const isMigrationError = errorCode === MIGRATION_ERROR_CODE;

  const showMessage = (text: string, isError: boolean) => {
    setMessage(text);
    setHasActionError(isError);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const clearMessage = () => {
    setMessage(null);
    setHasActionError(false);
  };

  // `succeededWith`: a restore that worked, so a failed restart doesn't read as data loss.
  const runRetry = async (succeededWith?: string) => {
    setActiveAction("retry");
    clearMessage();

    try {
      await onRetry();
    } catch (error) {
      console.error("Failed to restart SpendyFly", error);
      showMessage(
        succeededWith
          ? `${succeededWith} Please close SpendyFly and open it again to see your data.`
          : "SpendyFly could not restart on its own. Please close the app and open it again.",
        !succeededWith,
      );
    } finally {
      setActiveAction(null);
    }
  };

  const runSaveCopy = async () => {
    setActiveAction("saveCopy");
    clearMessage();

    try {
      const result = await saveRecoveryDatabase();
      if (!result.success) showMessage(result.message, true);
    } catch (error) {
      console.error("Recovery action failed", error);
      showMessage("That did not work. Please try again.", true);
    } finally {
      setActiveAction(null);
    }
  };

  const runRestoreAction = async (
    action: RecoveryAction,
    restore: () => Promise<RecoveryActionResult>,
  ) => {
    setActiveAction(action);
    clearMessage();

    let restoredWith: string | null = null;

    try {
      const result = await restore();
      if (result.canceled) return;

      showMessage(result.message, !result.success);
      if (result.success) restoredWith = result.message;
    } catch (error) {
      console.error("Recovery restore failed", error);
      showMessage("That did not work. Please try again.", true);
    } finally {
      setActiveAction(null);
    }

    if (restoredWith) {
      await runRetry(restoredWith);
    }
  };

  const runRestore = () => runRestoreAction("restore", restoreRecoveryBackup);

  const runStartOver = () => runRestoreAction("startOver", startOverWithEmptyDatabase);

  const confirmRestore = () => {
    Alert.alert(
      "Load a backup?",
      "This replaces everything currently on this phone with what is in the backup file you choose.\n\nIf you might still need what is on the phone now, save a copy of it first.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Choose file", style: "destructive", onPress: runRestore },
      ],
    );
  };

  const confirmStartOver = () => {
    Alert.alert(
      "Start fresh?",
      "SpendyFly will open with nothing in it. Your transactions, wallets and categories will not be in the app any more.\n\nYour old data is kept on this phone rather than deleted. Send a copy to support first so it can be repaired and loaded back later.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Save a copy first", onPress: runSaveCopy },
        { text: "Start fresh", style: "destructive", onPress: runStartOver },
      ],
    );
  };

  const emailSupport = async () => {
    setActiveAction("support");
    clearMessage();

    const subject = encodeURIComponent(`SpendyFly startup problem (${errorCode})`);
    // Some mail apps drop an over-long mailto link.
    const detail = (errorDetail ?? "none").slice(0, 300);
    const body = encodeURIComponent(
      `SpendyFly could not start.\n\nError code: ${errorCode}\nDetails: ${detail}\n\nPlease attach the SpendyFly_backup file you saved with "Save A Copy", if you have one.\n\nWhat happened before the problem:\n`,
    );

    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
    } catch (error) {
      console.error("Failed to open email app", error);
      showMessage(`Could not open an email app. Please email ${SUPPORT_EMAIL}.`, true);
    } finally {
      setActiveAction(null);
    }
  };

  const isBusy = activeAction !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Feather name='alert-triangle' size={20} color={theme.colors.danger} />
            <Text style={styles.title}>SpendyFly couldn't load your data</Text>
          </View>
          <Text style={styles.technicalSummary}>
            {isMigrationError
              ? "The database could not be updated to the latest version."
              : "The database file could not be opened."}
          </Text>
          <Text style={styles.description}>
            {isMigrationError
              ? "Your data is still here and most likely fine. Don't uninstall the app or clear its storage, or your data is gone for good."
              : "Your data is still here. Nothing has been deleted, but don't uninstall the app or clear its storage, or it's gone for good. Usually happens when the app is closed or the phone loses power while saving, when storage runs low, or when a phone-cleaner app interferes."}
          </Text>

          {message && (
            <View style={[styles.messageBox, hasActionError && styles.errorMessageBox]}>
              <Text style={[styles.message, hasActionError && styles.errorMessage]}>{message}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <CustomButton
              title='Try Again'
              onPress={() => runRetry()}
              disabled={isBusy}
              isLoading={activeAction === "retry"}
            />
            <CustomButton
              title='Choose A Backup File'
              onPress={confirmRestore}
              disabled={isBusy}
              isLoading={activeAction === "restore"}
            />
          </View>
          <Text style={styles.groupHint}>
            Try again first. Loading a backup brings everything back to how it was when the backup
            was made, so anything added since then will be lost.
          </Text>

          <Text style={styles.groupTitle}>Send your data to support</Text>
          <Text style={styles.groupHint}>
            No backup? Save a copy first, then email it to {SUPPORT_EMAIL} as an attachment. We
            will try to repair it and send it back for you to load.
          </Text>
          <View style={styles.actions}>
            <CustomButton
              title='Save A Copy'
              onPress={runSaveCopy}
              disabled={isBusy}
              isLoading={activeAction === "saveCopy"}
              outline
            />
            <CustomButton
              title='Email Support'
              onPress={emailSupport}
              disabled={isBusy}
              isLoading={activeAction === "support"}
              outline
            />
          </View>

          {!isMigrationError && (
            <>
              <Text style={styles.groupTitle}>Last resort</Text>
              <Text style={styles.groupHint}>Starts empty. Your old data stays on the phone.</Text>
              <View style={styles.actions}>
                <CustomButton
                  title='Start Fresh'
                  onPress={confirmStartOver}
                  disabled={isBusy}
                  isLoading={activeAction === "startOver"}
                  type='danger'
                  outline
                />
              </View>
            </>
          )}

          <Text style={styles.errorCode}>Error code: {errorCode}</Text>
          {errorDetail && (
            <Text style={styles.errorCode} selectable>
              {errorDetail.slice(0, 300)}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InitializationRecoveryScreen;

const createStyles = (theme: ReturnType<typeof useAppTheme>["theme"]) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 20,
    },
    card: {
      borderRadius: 20,
      padding: 24,
      backgroundColor: theme.colors.card,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    title: {
      flexShrink: 1,
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "700",
      lineHeight: 26,
    },
    technicalSummary: {
      marginTop: 6,
      color: theme.colors.muted,
      fontSize: 13,
      lineHeight: 19,
    },
    description: {
      marginTop: 14,
      color: theme.colors.muted,
      fontSize: 15,
      lineHeight: 22,
    },
    actions: {
      marginTop: 16,
      gap: 12,
    },
    groupTitle: {
      marginTop: 26,
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "700",
    },
    groupHint: {
      marginTop: 6,
      color: theme.colors.muted,
      fontSize: 13,
      lineHeight: 19,
    },
    messageBox: {
      marginTop: 18,
      borderRadius: 10,
      padding: 12,
      backgroundColor: theme.colors.info,
    },
    errorMessageBox: {
      backgroundColor: `${theme.colors.danger}18`,
    },
    message: {
      color: theme.colors.text,
      fontSize: 13,
      lineHeight: 19,
    },
    errorMessage: {
      color: theme.colors.danger,
    },
    errorCode: {
      marginTop: 12,
      color: theme.colors.muted,
      fontSize: 11,
    },
  });
