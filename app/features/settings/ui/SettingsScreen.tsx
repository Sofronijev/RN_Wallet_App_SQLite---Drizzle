import { ScrollView, StyleSheet } from "react-native";
import React from "react";
import AppActivityIndicator from "components/AppActivityIndicator";
import SettingsListItem from "./SettingsListItem";
import { Ionicons, MaterialIcons, Octicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { exportDB, importDb } from "../modules/exportDb";
import { useThemeSwitcher } from "app/theme/useThemeSwitcher";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";

type SettingsScreenProps = {};

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const { getThemeIcon, changeTheme } = useThemeSwitcher();
  const styles = useThemedStyles(themeStyles);
  const { text } = useColors();

  const chevronIcon = <MaterialIcons name='chevron-right' size={30} color={text} />;

  const settingsListItems = [
    {
      id: 0,
      title: "Theme",
      icon: <MaterialIcons name='lightbulb-outline' size={24} color={text} />,
      onPress: changeTheme,
      rightIcon: getThemeIcon(),
    },
    {
      id: 1,
      title: "Wallets",
      icon: <Ionicons name='wallet-outline' size={24} color={text} />,
      onPress: () => navigation.navigate("WalletSettings"),
      rightIcon: chevronIcon,
    },
    {
      id: 2,
      title: "Categories",
      icon: <MaterialIcons name='category' size={24} color={text} />,
      onPress: () => navigation.navigate("CategorySettings"),
      rightIcon: chevronIcon,
    },
    {
      id: 3,
      title: "Number separators",
      icon: <Octicons name='number' size={24} color={text} />,
      onPress: () => navigation.navigate("NumberSeparators"),
      rightIcon: chevronIcon,
    },
    {
      id: 4,
      title: "Dashboard",
      icon: <MaterialCommunityIcons name='view-dashboard-outline' size={24} color={text} />,
      onPress: () => navigation.navigate("DashboardSettings"),
      rightIcon: chevronIcon,
    },
    {
      id: 5,
      title: "Export data",
      icon: <Ionicons name='exit-outline' size={24} color={text} />,
      onPress: exportDB,
      rightIcon: chevronIcon,
    },
    {
      id: 6,
      title: "Import data",
      icon: <Ionicons name='enter-outline' size={24} color={text} />,
      onPress: importDb,
      rightIcon: chevronIcon,
    },
    {
      id: 7,
      title: "Pin code",
      icon: <MaterialIcons name='password' size={24} color={text} />,
      onPress: () => navigation.navigate("PinSettings"),
      rightIcon: chevronIcon,
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

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: 16,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.background,
    },
  });
