import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";

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
        "db.db",
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
