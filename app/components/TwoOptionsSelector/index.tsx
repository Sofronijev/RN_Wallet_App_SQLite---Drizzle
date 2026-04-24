import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Option<T> = { value: T; label: string };

type TwoOptionSelectorProps<T> = {
  left: Option<T>;
  right: Option<T>;
  selected: T;
  onChange?: (selected: T) => void;
};

function TwoOptionSelector<T>({
  left,
  right,
  selected = left.value,
  onChange,
}: TwoOptionSelectorProps<T>) {
  const styles = useThemedStyles(themedStyles);

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.option, selected === left.value && styles.selected]}
        onPress={() => onChange?.(left.value)}
      >
        <Text style={[styles.label, selected === left.value && styles.labelSelected]}>
          {left.label}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.option, selected === right.value && styles.selected]}
        onPress={() => onChange?.(right.value)}
      >
        <Text style={[styles.label, selected === right.value && styles.labelSelected]}>
          {right.label}
        </Text>
      </Pressable>
    </View>
  );
}

export default TwoOptionSelector;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      borderRadius: 8,
      backgroundColor: theme.colors.cardInner,
      padding: 4,
      gap: 4,
    },
    option: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 6,
    },
    selected: {
      backgroundColor: theme.colors.card,
    },
    label: {
      fontSize: 13,
      fontWeight: "500",
      color: theme.colors.muted,
    },
    labelSelected: {
      color: theme.colors.text,
      fontWeight: "600",
    },
  });
