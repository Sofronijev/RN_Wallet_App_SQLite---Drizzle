import React from "react";
import { FlatList, ListRenderItem, StyleSheet, TextInput, View } from "react-native";
import Label from "components/Label";
import ShadowBoxView from "components/ShadowBoxView";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { CustomIntervalUnit, Recurrence } from "app/features/upcomingPayments/modules/types";
import {
  RECURRENCE_OPTIONS,
  UNIT_OPTIONS,
} from "app/features/upcomingPayments/modules/recurrenceLabel";
import SelectableChip from "components/SelectableChip";

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

  const renderOption: ListRenderItem<{ value: Recurrence; label: string }> = ({ item }) => (
    <SelectableChip
      label={item.label}
      selected={recurrence === item.value}
      onPress={() => onRecurrenceChange(item.value)}
    />
  );

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
            {UNIT_OPTIONS.map((unit) => (
              <SelectableChip
                key={unit.value}
                label={unit.label}
                selected={customIntervalUnit === unit.value}
                onPress={() => onCustomIntervalUnitChange(unit.value)}
                compact
              />
            ))}
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
  });
