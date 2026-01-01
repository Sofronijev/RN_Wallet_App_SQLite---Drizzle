import { StyleSheet, Text, View } from "react-native";
import React, { FC } from "react";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import Label from "components/Label";

type Props = { text: string };

const LabelInfo: FC<Props> = ({ text }) => {
  const styles = useThemedStyles(themedStyles);

  return (
    <View>
      <Label style={styles.text}>{text}</Label>
    </View>
  );
};

export default LabelInfo;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    text: {
      backgroundColor: theme.colors.cardInner,
      color: theme.colors.muted,
      padding: 8,
      borderRadius: 8,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
  });
