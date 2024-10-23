import { StyleSheet, View } from "react-native";
import React from "react";
import AppActivityIndicator from "components/AppActivityIndicator";
import SettingsListItem from "./SettingsListItem";
import { Ionicons } from "@expo/vector-icons";
import colors from "constants/colors";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";

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
  ];

  const renderItems = () =>
    settingsListItems.map((item) => (
      <SettingsListItem key={item.id} title={item.title} icon={item.icon} onPress={item.onPress} />
    ));

  return (
    <View style={styles.container}>
      {renderItems()}
      <AppActivityIndicator isLoading={false} />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
});
