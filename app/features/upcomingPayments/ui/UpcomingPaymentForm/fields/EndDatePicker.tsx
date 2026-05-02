import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { startOfDay } from "date-fns";
import { pressableOpacityStyle } from "modules/pressable";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Label from "components/Label";
import DatePickerInput from "app/features/balance/ui/TransactionForm/DatePickerInput";
import { formatIsoDate } from "modules/timeAndDate";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";

type Props = {
  endDate: string | null;
  onChange: (endDate: string | null) => void;
  minimumDate?: Date;
};

const EndDatePicker: React.FC<Props> = ({ endDate, onChange, minimumDate }) => {
  const styles = useThemedStyles(themeStyles);
  const { primary, muted } = useColors();

  const hasEnd = endDate !== null;

  const selectNoEnd = () => onChange(null);
  const selectHasEnd = () => {
    if (!hasEnd) {
      onChange(formatIsoDate(startOfDay(minimumDate ?? new Date())));
    }
  };

  return (
    <View>
      <Label style={styles.heading}>End date</Label>
      <View style={styles.row}>
        <Pressable style={pressableOpacityStyle(styles.radioRow)} onPress={selectNoEnd}>
          <MaterialIcons
            name={hasEnd ? "radio-button-unchecked" : "radio-button-checked"}
            size={22}
            color={hasEnd ? muted : primary}
          />
          <Label style={styles.radioText}>No end date</Label>
        </Pressable>
        <Pressable style={pressableOpacityStyle(styles.radioRow)} onPress={selectHasEnd}>
          <MaterialIcons
            name={hasEnd ? "radio-button-checked" : "radio-button-unchecked"}
            size={22}
            color={hasEnd ? primary : muted}
          />
          <Label style={styles.radioText}>Ends on</Label>
        </Pressable>
      </View>
      {hasEnd && (
        <View style={styles.dateWrapper}>
          <DatePickerInput
            date={new Date(endDate)}
            onDateSelect={onChange}
            minimumDate={minimumDate}
            hideTime
          />
        </View>
      )}
    </View>
  );
};

export default EndDatePicker;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    heading: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.colors.muted,
      paddingBottom: 8,
    },
    row: {
      flexDirection: "row",
      gap: 16,
      flexWrap: "wrap",
    },
    radioRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
    },
    radioText: {
      fontSize: 15,
    },
    dateWrapper: {
      marginTop: 10,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
  });
