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
import ShadowBoxView from "components/ShadowBoxView";
import Label from "components/Label";
import AntDesign from "@expo/vector-icons/AntDesign";

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
          <ShadowBoxView style={styles.flex}>
            <TouchableOpacity onPress={showCalendar} style={styles.row}>
              <FontAwesome name='calendar' size={24} color={colors.greenMint} />
              <Label>{getFormattedDate(value, calendarDateFormat)}</Label>
            </TouchableOpacity>
          </ShadowBoxView>
          <ShadowBoxView style={styles.flex}>
            <TouchableOpacity onPress={showClock} style={styles.row}>
              <AntDesign name='clock-circle' size={24} color={colors.greenMint} />
              <Label>{formatTime(value)}</Label>
            </TouchableOpacity>
          </ShadowBoxView>
        </View>
      )}
      {showDate && (
        <DateTimePicker
          value={value}
          mode={isIosDevice ? "datetime" : "date"}
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
    columnGap: 16,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 8,
  },
});
