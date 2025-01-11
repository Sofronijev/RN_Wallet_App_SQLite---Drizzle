import { Alert, Platform, ScrollView, StyleSheet } from "react-native";
import React from "react";
import AppActivityIndicator from "components/AppActivityIndicator";
import SettingsListItem from "./SettingsListItem";
import { Ionicons, AntDesign   } from "@expo/vector-icons";
import colors from "constants/colors";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

type SettingsScreenProps = {};

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const exportDB = async () => {
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      Alert.alert("Exporting is not supported on the current device");
      return;
    }

    if (Platform.OS === "android") {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
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
          .catch((e) =>
            Alert.alert("File not saved", "There was an error while trying to save the data")
          );
      }
    } else {
      await Sharing.shareAsync(FileSystem.documentDirectory + "SQLite/db.db");
    }
  };

  const settingsListItems = [
    {
      id: 1,
      title: "Wallets",
      icon: <Ionicons name='wallet-outline' size={24} color={colors.black} />,
      onPress: () => navigation.navigate("WalletSettings"),
    },
    {
      id: 2,
      title: "Export data",
      icon: <AntDesign name="export" size={24} color="black" />,
      onPress: exportDB,
    },
  ];

  const renderItems = () =>
    settingsListItems.map((item) => (
      <SettingsListItem key={item.id} title={item.title} icon={item.icon} onPress={item.onPress} />
    ));

  return (
    <ScrollView style={styles.container}>
      {renderItems()}
      <AppActivityIndicator isLoading={false} />
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
});
