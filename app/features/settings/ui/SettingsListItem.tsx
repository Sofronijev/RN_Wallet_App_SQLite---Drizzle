import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

type Props = {
  title: string;
  icon: React.JSX.Element;
  onPress: () => void;
  rightIcon?: React.JSX.Element;
};

const SettingsListItem: React.FC<Props> = ({ title, icon, onPress, rightIcon }) => {
  const styles = useThemedStyles(themeStyles);
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.row}>
        {icon}
        <Label style={styles.title}>{title}</Label>
      </View>
      {rightIcon && rightIcon}
    </TouchableOpacity>
  );
};

export default SettingsListItem;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.card,
      borderRadius: 8,
      marginBottom: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
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
