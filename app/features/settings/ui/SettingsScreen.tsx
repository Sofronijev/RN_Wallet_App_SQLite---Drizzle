import { ScrollView, StyleSheet } from "react-native";
import React from "react";
import AppActivityIndicator from "components/AppActivityIndicator";
import SettingsListItem from "./SettingsListItem";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import colors from "constants/colors";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { exportDB, importDb } from "../modules/exportDb";

type SettingsScreenProps = {};

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

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
      icon: <Ionicons name='exit-outline' size={24} color={colors.black} />,
      onPress: exportDB,
    },
    {
      id: 3,
      title: "Import data",
      icon: <Ionicons name='enter-outline' size={24} color={colors.black} />,
      onPress: importDb,
    },
    {
      id: 4,
      title: "Pin code",
      icon: <MaterialIcons name='password' size={24} color={colors.black} />,
      onPress: () => navigation.navigate("PinSettings"),
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
