import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Separator from "components/Separator";

type Props = {
  title: string;
  icon: React.JSX.Element;
  onPress: () => void;
  rightIcon?: React.JSX.Element;
};

const SettingsListItem: React.FC<Props> = ({ title, icon, onPress, rightIcon }) => {
  return (
    <>
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <View style={styles.row}>
          {icon}
          <Text style={styles.title}>{title}</Text>
        </View>
        {rightIcon && rightIcon}
      </TouchableOpacity>
      <Separator />
    </>
  );
};

export default SettingsListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  title: {
    paddingLeft: 15,
    fontSize: 15,
  },
});
