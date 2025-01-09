import React, { useState } from "react";
import { Keyboard, Platform, StyleSheet, TextStyle, TouchableOpacity, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  calendarDateFormat,
  formatIsoDate,
  formatTime,
  getFormattedDate,
} from "modules/timeAndDate";
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
}) => {
  const value = date || new Date();
  const [showDate, setShowDate] = useState(isIosDevice);
  const [showTime, setShowTime] = useState(isIosDevice);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate ?? new Date();
    setShowDate(isIosDevice);
    if (typeof onDateSelect === "function") onDateSelect(formatIsoDate(currentDate));
  };

  const onChangeTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate ?? new Date();
    setShowTime(isIosDevice);
    if (typeof onDateSelect === "function") onDateSelect(formatIsoDate(currentDate));
  };

  const showCalendar = () => {
    Keyboard.dismiss();
    setShowDate(true);
  };
  const showClock = () => {
    Keyboard.dismiss();
    setShowTime(true);
  };
  // BUG - IOS BUG - Calendar for IOS doesn't look good
  return (
    <View>
      {!isIosDevice && (
        <View style={styles.container}>
          <TouchableOpacity onPress={showCalendar} style={styles.dateLabel}>
            <StyledLabelInput
              value={getFormattedDate(value, calendarDateFormat)}
              icon={<FontAwesome name='calendar' size={24} color={colors.greenMint} />}
              editable={false}
              inputStyle={styles.dateLabel}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={showClock} style={styles.dateLabel}>
            <StyledLabelInput
              value={formatTime(value)}
              icon={<FontAwesome name='calendar' size={24} color={colors.greenMint} />}
              editable={false}
              inputStyle={styles.dateLabel}
            />
          </TouchableOpacity>
        </View>
      )}
      {showDate && (
        <DateTimePicker
          value={value}
          mode={isIosDevice ? "datetime" : "date"}
          is24Hour={!isIosDevice}
          onChange={onChangeDate}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
      {showTime && !isIosDevice && (
        <DateTimePicker
          value={value}
          mode='time'
          is24Hour
          onChange={onChangeTime}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
};

export default DatePickerInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 16,
  },
  dateLabel: {
    color: colors.black,
    backgroundColor: colors.white,
    borderRadius: 10,
    flex: 1,
  },
});
