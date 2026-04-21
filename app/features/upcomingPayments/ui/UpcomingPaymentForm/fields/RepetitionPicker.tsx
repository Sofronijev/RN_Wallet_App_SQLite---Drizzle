import React from "react";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Label from "components/Label";
import ShadowBoxView from "components/ShadowBoxView";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import colors from "constants/colors";
import { pressableOpacityStyle } from "modules/pressable";
import { CustomIntervalUnit, Recurrence } from "app/features/upcomingPayments/modules/types";

const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: "none", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

const UNIT_OPTIONS: { value: CustomIntervalUnit; label: string }[] = [
  { value: "day", label: "Days" },
  { value: "week", label: "Weeks" },
  { value: "month", label: "Months" },
];

type Props = {
  recurrence: Recurrence;
  onRecurrenceChange: (value: Recurrence) => void;
  customIntervalValue: number | null;
  onCustomIntervalValueChange: (value: number | null) => void;
  customIntervalUnit: CustomIntervalUnit | null;
  onCustomIntervalUnitChange: (value: CustomIntervalUnit) => void;
};

const RepetitionPicker: React.FC<Props> = ({
  recurrence,
  onRecurrenceChange,
  customIntervalValue,
  onCustomIntervalValueChange,
  customIntervalUnit,
  onCustomIntervalUnitChange,
}) => {
  const styles = useThemedStyles(themeStyles);

  const renderOption: ListRenderItem<{ value: Recurrence; label: string }> = ({ item }) => {
    const isSelected = recurrence === item.value;
    return (
      <Pressable
        style={pressableOpacityStyle([styles.chip, isSelected && styles.chipSelected])}
        onPress={() => onRecurrenceChange(item.value)}
      >
        <Label style={styles.chipText}>{item.label}</Label>
      </Pressable>
    );
  };

  const onIntervalChange = (text: string) => {
    const parsed = parseInt(text, 10);
    onCustomIntervalValueChange(Number.isFinite(parsed) ? parsed : null);
  };

  return (
    <View>
      <Label style={styles.heading}>Repeats</Label>
      <FlatList
        data={RECURRENCE_OPTIONS}
        horizontal
        renderItem={renderOption}
        keyExtractor={(item) => item.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      {recurrence === "custom" && (
        <ShadowBoxView style={styles.customRow}>
          <Label style={styles.customLabel}>Every</Label>
          <TextInput
            style={styles.customInput}
            keyboardType='number-pad'
            maxLength={3}
            value={customIntervalValue ? String(customIntervalValue) : ""}
            onChangeText={onIntervalChange}
            placeholder='1'
            placeholderTextColor={styles.placeholderColor.color}
          />
          <View style={styles.unitWrapper}>
            {UNIT_OPTIONS.map((unit) => {
              const isSelected = customIntervalUnit === unit.value;
              return (
                <Pressable
                  key={unit.value}
                  style={pressableOpacityStyle([styles.unitChip, isSelected && styles.chipSelected])}
                  onPress={() => onCustomIntervalUnitChange(unit.value)}
                >
                  <Label style={styles.chipText}>{unit.label}</Label>
                </Pressable>
              );
            })}
          </View>
        </ShadowBoxView>
      )}
    </View>
  );
};

export default RepetitionPicker;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    heading: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.colors.muted,
      paddingBottom: 8,
    },
    listContent: {
      paddingVertical: 4,
      gap: 8,
    },
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
    chipSelected: {
      backgroundColor: theme.colors.selected,
      borderColor: theme.colors.primary,
    },
    chipText: {
      fontSize: 14,
      fontWeight: "500",
    },
    customRow: {
      marginTop: 12,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    customLabel: {
      fontSize: 15,
      fontWeight: "500",
    },
    customInput: {
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      minWidth: 56,
      textAlign: "center",
      color: theme.colors.text,
      fontSize: 15,
    },
    placeholderColor: {
      color: theme.colors.placeholder,
    },
    unitWrapper: {
      flexDirection: "row",
      gap: 6,
      flex: 1,
      flexWrap: "wrap",
    },
    unitChip: {
      borderColor: theme.colors.border,
      borderWidth: 1.5,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.cardInner,
    },
  });
