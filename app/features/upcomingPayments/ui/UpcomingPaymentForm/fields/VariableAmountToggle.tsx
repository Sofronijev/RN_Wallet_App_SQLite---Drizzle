import React from "react";
import { StyleSheet, View } from "react-native";
import Label from "components/Label";
import AppSwitch from "components/AppSwitch";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

const VariableAmountToggle: React.FC<Props> = ({ value, onChange }) => {
  const styles = useThemedStyles(themeStyles);

  return (
    <View style={styles.row}>
      <View style={styles.textWrapper}>
        <Label style={styles.label}>Amount varies each period</Label>
        <Label style={styles.helper}>
          Leave amount blank — you'll enter it when each payment is due.
        </Label>
      </View>
      <AppSwitch value={value} onValueChange={onChange} />
    </View>
  );
};

export default VariableAmountToggle;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 8,
    },
    textWrapper: {
      flex: 1,
    },
    label: {
      fontSize: 15,
      fontWeight: "500",
    },
    helper: {
      fontSize: 13,
      color: theme.colors.muted,
      paddingTop: 2,
    },
  });
