import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import colors from "constants/colors";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Option<T> = { value: T; label: string };

interface TwoOptionSelectorProps<T> {
  left: Option<T>;
  right: Option<T>;
  initialSelected?: T;
  onChange?: (selected: Option<T>) => void;
}

function TwoOptionSelector<T>({
  left,
  right,
  initialSelected = left.value,
  onChange,
}: TwoOptionSelectorProps<T>) {
  const [selected, setSelected] = useState<T>(initialSelected);
  const styles = useThemedStyles(themedStyles);

  const handleSelect = (option: Option<T>) => {
    setSelected(option.value);
    onChange?.(option);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, selected === left.value && styles.selected]}
        onPress={() => handleSelect(left)}
      >
        <Text style={[styles.label, selected === left.value && styles.labelSelected]}>
          {left.label}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, selected === right.value && styles.selected]}
        onPress={() => handleSelect(right)}
      >
        <Text style={[styles.label, selected === right.value && styles.labelSelected]}>
          {right.label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default TwoOptionSelector;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
      borderColor: theme.colors.border,
    },
    option: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      backgroundColor: theme.colors.cardInner,
    },
    selected: {
      backgroundColor: theme.colors.primary,
    },
    label: {
      color: theme.colors.text,
      fontWeight: "500",
      paddingHorizontal: 8,
    },
    labelSelected: {
      color: colors.white,
    },
  });
