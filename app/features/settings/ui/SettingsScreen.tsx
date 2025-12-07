import { ScrollView, StyleSheet } from "react-native";
import React from "react";
import AppActivityIndicator from "components/AppActivityIndicator";
import SettingsListItem from "./SettingsListItem";
import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import colors from "constants/colors";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { exportDB, importDb } from "../modules/exportDb";
import { useThemeSwitcher } from "app/theme/useThemeSwitcher";

type SettingsScreenProps = {};

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const { getThemeIcon, changeTheme } = useThemeSwitcher();

  const settingsListItems = [
    {
      id: 0,
      title: "Theme",
      icon: <MaterialIcons name='lightbulb-outline' size={24} color={colors.black} />,
      onPress: changeTheme,
      rightIcon: getThemeIcon(),
    },
    {
      id: 1,
      title: "Wallets",
      icon: <Ionicons name='wallet-outline' size={24} color={colors.black} />,
      onPress: () => navigation.navigate("WalletSettings"),
    },
    {
      id: 2,
      title: "Number separators",
      icon: <Octicons name='number' size={24} color={colors.black} />,
      onPress: () => navigation.navigate("NumberSeparators"),
    },
    {
      id: 3,
      title: "Export data",
      icon: <Ionicons name='exit-outline' size={24} color={colors.black} />,
      onPress: exportDB,
    },
    {
      id: 4,
      title: "Import data",
      icon: <Ionicons name='enter-outline' size={24} color={colors.black} />,
      onPress: importDb,
    },
    {
      id: 5,
      title: "Pin code",
      icon: <MaterialIcons name='password' size={24} color={colors.black} />,
      onPress: () => navigation.navigate("PinSettings"),
    },
  ];

  const renderItems = () =>
    settingsListItems.map((item) => (
      <SettingsListItem
        key={item.id}
        title={item.title}
        icon={item.icon}
        onPress={item.onPress}
        rightIcon={item.rightIcon}
      />
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
