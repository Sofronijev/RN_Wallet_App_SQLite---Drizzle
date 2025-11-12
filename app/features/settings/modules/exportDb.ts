import { Alert, Platform } from "react-native";
import * as Sharing from "expo-sharing";
// TODO - remove legacy
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import * as Updates from "expo-updates";

export const exportDB = async () => {
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    Alert.alert("Exporting is not supported on the current device");
    return;
  }

  if (Platform.OS === "android") {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (permissions.granted) {
      const base64 = await FileSystem.readAsStringAsync(
        FileSystem.documentDirectory + "SQLite/db.db",
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        "walletApp.db",
        "application/octet-stream"
      )
        .then(async (uri) => {
          await FileSystem.writeAsStringAsync(uri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        })
        .catch(() =>
          Alert.alert("File not saved", "There was an error while trying to save the data")
        );
    }
  } else {
    await Sharing.shareAsync(FileSystem.documentDirectory + "SQLite/db.db");
  }
};

// TODO - this is just a quick add, try to make it better
export const importDb = async () => {
  let result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
  });

  if (!result.canceled) {
    // Ensure the SQLite directory exists
    const sqliteDir = FileSystem.documentDirectory + "SQLite";
    if (!(await FileSystem.getInfoAsync(sqliteDir)).exists) {
      await FileSystem.makeDirectoryAsync(sqliteDir);
    }

    // Read the selected file as base64
    const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Write the base64 data to the db.db file (replacing the old one)
    await FileSystem.writeAsStringAsync(
      sqliteDir + "/db.db", // Make sure to use the same name as the existing SQLite DB
      base64,
      { encoding: FileSystem.EncodingType.Base64 }
    );

    // Need to restart the app so the new db can be loaded
    Alert.alert(
      "Restarting App",
      "The database will be replaced and the app will restart.",
      [
        {
          text: "OK",
          onPress: async () => {
            try {
              await Updates.reloadAsync();
            } catch (error) {
              console.error("Failed to restart the app:", error);
            }
          },
        },
      ],
      { cancelable: false }
    );

    // Close the current database connection (optional, but ensures proper cleanup)
    // await expoDb.closeAsync();

    // Reopen the SQLite database with the new db.db
    // setDb(SQLite.openDatabase("db.db"));
  }
};
