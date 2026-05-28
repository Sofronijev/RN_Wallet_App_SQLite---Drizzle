import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import colors from "constants/colors";
import { pressableOpacityStyle } from "modules/pressable";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
};

const SelectableChip: React.FC<Props> = ({ label, selected, onPress, compact = false }) => {
  const styles = useThemedStyles(themeStyles);
  const chipStyle = compact ? styles.chipCompact : styles.chip;
  return (
    <Pressable
      style={pressableOpacityStyle([chipStyle, selected && styles.chipSelected])}
      onPress={onPress}
    >
      <Label style={styles.chipText}>{label}</Label>
    </Pressable>
  );
};

export default SelectableChip;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    chip: {
      borderColor: theme.colors.border,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.cardInner,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    chipCompact: {
      borderColor: theme.colors.border,
      borderWidth: 1.5,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.cardInner,
    },
    chipSelected: {
      backgroundColor: theme.colors.selected,
      borderColor: theme.colors.primary,
    },
    chipText: {
      fontSize: 14,
      fontWeight: "500",
    },
  });
