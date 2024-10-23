import React, { useState } from "react";
import { Keyboard, Platform, StyleSheet, TextStyle, TouchableOpacity, View } from "react-native";
import DateTimePicker, { Event } from "@react-native-community/datetimepicker";
import { calendarDateFormat, formatIsoDate, getFormattedDate } from "modules/timeAndDate";
import colors from "constants/colors";
import StyledLabelInput from "components/StyledLabelInput";
import { FontAwesome } from "@expo/vector-icons";

const isIosDevice = Platform.OS === "ios";

type DatePickerInputProps = {
  date: Date;
  maximumDate?: Date;
  minimumDate?: Date;
  onDateSelect?: (selectedDate: string) => void;
  style?: TextStyle;
};

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  date,
  maximumDate,
  minimumDate,
  onDateSelect,
  style,
}) => {
  const value = date || new Date();
  const [show, setShow] = useState(isIosDevice);

  const onChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate ?? new Date();
    setShow(isIosDevice);
    if (typeof onDateSelect === "function") onDateSelect(formatIsoDate(currentDate));
  };
  const showCalendar = () => {
    Keyboard.dismiss();
    setShow(true);
  };
  // BUG - IOS BUG - Calendar for IOS doesn't look good
  return (
    <View>
      {!isIosDevice && (
        <TouchableOpacity onPress={showCalendar} style={styles.dateLabel}>
          <StyledLabelInput
            value={getFormattedDate(value, calendarDateFormat)}
            icon={<FontAwesome name='calendar' size={24} color={colors.greenMint} />}
            editable={false}
            inputStyle={styles.dateLabel}
          />
        </TouchableOpacity>
      )}
      {show && (
        <DateTimePicker
          testID='dateTimePicker'
          value={value}
          mode='date'
          is24Hour={true}
          onChange={onChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
};

export default DatePickerInput;

const styles = StyleSheet.create({
  dateLabel: {
    color: colors.black,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
});
