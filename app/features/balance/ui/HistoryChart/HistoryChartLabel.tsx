import { StyleSheet, View } from "react-native";
import React, { FC } from "react";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

type Props = {
  date: string;
  value: string;
};

const HistoryChartLabel: FC<Props> = ({ date, value }) => {
  const styles = useThemedStyles(themedStyles);
  return (
    <View style={styles.container}>
      <Label style={styles.date}>{date}</Label>

      <View style={styles.valueContainer}>
        <Label style={styles.value}>{value}</Label>
      </View>
    </View>
  );
};

export default HistoryChartLabel;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
    },
    date: {
      color: theme.colors.text,
      fontSize: 14,
      marginBottom: 6,
      textAlign: "center",
    },
    valueContainer: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.colors.cardInner,
    },
    value: { fontWeight: "bold", textAlign: "center", color: theme.colors.text },
  });
