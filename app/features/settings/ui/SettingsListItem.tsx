import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Separator from "components/Separator";

type Props = {
  title: string;
  icon: React.JSX.Element;
  onPress: () => void;
};

const SettingsListItem: React.FC<Props> = ({ title, icon, onPress }) => {
  return (
    <>
      <TouchableOpacity onPress={onPress} style={styles.container}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
      <Separator />
    </>
  );
};

export default SettingsListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
  },
  title: {
    paddingLeft: 15,
    fontSize: 15,
  },
});
