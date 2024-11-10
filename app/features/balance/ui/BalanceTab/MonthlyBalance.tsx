import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import Label from "components/Label";
import colors from "constants/colors";
import { getMonthAndYear } from "modules/timeAndDate";
import { formatDecimalDigits } from "modules/numbers";
import AppActivityIndicator from "components/AppActivityIndicator";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { transactionStrings } from "constants/strings";
import { addMonths, isSameMonth, subMonths } from "date-fns";
import useGetSelectedWallet from "../../hooks/useGetSelectedWallet";
import useGetMonthlyBalance from "../../hooks/useGetMonthlyBalance";

const TODAY = new Date();

const MonthlyBalance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const { selectedWalletId } = useGetSelectedWallet();
  const { balance, expense, income } = useGetMonthlyBalance(selectedWalletId, selectedDate);

  const formattedMonth = getMonthAndYear(selectedDate);
  const isCurrentMonth = isSameMonth(selectedDate, TODAY);

  const addMonth = () => {
    if (!isCurrentMonth) {
      setSelectedDate(addMonths(selectedDate, 1));
    }
  };
  const deductMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };
  const setCurrentMonth = () => {
    setSelectedDate(TODAY);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.titleContainer]}>
        <Label style={styles.title}>{formattedMonth}</Label>
        <View style={styles.icons}>
          <TouchableOpacity onPress={deductMonth} style={styles.icon}>
            <FontAwesome name='chevron-left' size={25} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity onPress={setCurrentMonth} style={styles.icon}>
            <MaterialCommunityIcons name='calendar-today' size={25} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity onPress={addMonth} style={styles.icon} disabled={isCurrentMonth}>
            <FontAwesome
              name='chevron-right'
              size={25}
              color={isCurrentMonth ? colors.disabled : colors.black}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <View style={styles.row}>
          <Label style={styles.label}>{transactionStrings.available}</Label>
          <Label style={[styles.balance, balance < 0 && styles.redBalance]}>
            {formatDecimalDigits(balance)}
          </Label>
        </View>
        <View style={styles.row}>
          <Label style={styles.label}>{transactionStrings.income}</Label>
          <Label style={styles.transactions}>{formatDecimalDigits(income)}</Label>
        </View>
        <View style={styles.row}>
          <Label style={styles.label}>{transactionStrings.expenses}</Label>
          <Label style={styles.transactions}>{formatDecimalDigits(expense)}</Label>
        </View>
        {/* <AppActivityIndicator isLoading={false} /> */}
      </View>
    </View>
  );
};

export default MonthlyBalance;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginVertical: 20,
    paddingVertical: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  titleContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: colors.black,
  },
  icons: {
    flexDirection: "row",
  },
  icon: {
    paddingLeft: 8,
  },
  balance: {
    fontSize: 30,
    textAlign: "right",
    color: colors.greenMint,
    fontWeight: "bold",
  },
  redBalance: {
    color: colors.redDark,
  },
  label: {
    fontSize: 18,
    color: colors.grey2,
  },
  transactions: {
    fontSize: 28,
    textAlign: "right",
    fontWeight: "bold",
    color: colors.black,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    alignItems: "center",
  },
  walletName: {
    fontSize: 25,
    fontWeight: "bold",
    paddingBottom: 5,
    paddingLeft: 30,
  },
});
