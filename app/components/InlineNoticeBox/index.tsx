import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

type Tone = "locked" | "info";

type Props = {
  text: string;
  tone?: Tone;
};

const InlineNoticeBox: React.FC<Props> = ({ text, tone = "locked" }) => {
  const styles = useThemedStyles(themeStyles);
  const iconName = tone === "locked" ? "lock-outline" : "info-outline";

  return (
    <View style={styles.box}>
      <MaterialIcons name={iconName} size={16} style={styles.icon} />
      <Label style={styles.label}>{text}</Label>
    </View>
  );
};

export default InlineNoticeBox;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    box: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      padding: 10,
      marginTop: 6,
      backgroundColor: theme.colors.cardInner,
      borderRadius: 8,
    },
    icon: {
      color: theme.colors.muted,
      marginTop: 1,
    },
    label: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.muted,
      lineHeight: 16,
    },
  });
