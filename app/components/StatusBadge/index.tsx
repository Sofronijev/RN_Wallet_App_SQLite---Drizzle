import React from "react";
import { StyleSheet } from "react-native";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

type Tone = "danger" | "muted";

type Props = {
  label: string;
  tone: Tone;
};

const StatusBadge: React.FC<Props> = ({ label, tone }) => {
  const styles = useThemedStyles(themeStyles);
  return <Label style={[styles.base, styles[tone]]}>{label}</Label>;
};

export default StatusBadge;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    base: {
      fontSize: 11,
      fontWeight: "700",
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 1,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    danger: {
      color: theme.colors.redDark,
      borderColor: theme.colors.redDark,
    },
    muted: {
      color: theme.colors.muted,
      borderColor: theme.colors.muted,
    },
  });
