import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import Label from "components/Label";
import colors from "constants/colors";
import { getMonthAndYear, monthYearFormat } from "modules/timeAndDate";
import { formatDecimalDigits } from "modules/numbers";
import AppActivityIndicator from "components/AppActivityIndicator";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { transactionStrings } from "constants/strings";
import { addMonths, format, subMonths } from "date-fns";
import { useGetMonthlyBalanceQuery } from "app/queries/transactions";
import { useGetSelectedWalletQuery } from "app/queries/wallets";
import MonthlyChart from "../MonthlyChart";
import ShadowBoxView from "components/ShadowBoxView";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";

const MONTH_START_DAY = "01";

const getMonthStartDate = (monthYeah: string) => new Date(`${monthYeah}-${MONTH_START_DAY}`);
const getCurrentMonth = () => format(new Date(), monthYearFormat);

const MonthlyBalance: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const { data: selectedWallet, isLoading: selectedWalletLoading } = useGetSelectedWalletQuery();
  const { data, isLoading } = useGetMonthlyBalanceQuery(selectedWallet?.walletId, selectedMonth);
  const { balance, expense, income } = data;
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const styles = useThemedStyles(themedStyles);
  const { text } = useColors();

  const formattedMonth = getMonthAndYear(selectedMonth);

  const addMonth = () => {
    setSelectedMonth((monthYear) =>
      format(addMonths(getMonthStartDate(monthYear), 1), monthYearFormat)
    );
  };

  const deductMonth = () => {
    setSelectedMonth((monthYear) =>
      format(subMonths(getMonthStartDate(monthYear), 1), monthYearFormat)
    );
  };

  const setCurrentMonth = () => {
    setSelectedMonth(getCurrentMonth());
  };

  return (
    <ShadowBoxView style={styles.container}>
      <View style={[styles.row, styles.titleContainer]}>
        <Label style={styles.title}>{formattedMonth}</Label>
        <View style={styles.icons}>
          <TouchableOpacity onPress={deductMonth} style={styles.icon}>
            <FontAwesome name='chevron-left' size={25} color={text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={setCurrentMonth} style={styles.icon}>
            <MaterialCommunityIcons name='calendar-today' size={25} color={text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={addMonth} style={styles.icon}>
            <FontAwesome name='chevron-right' size={25} color={text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <Label style={styles.label}>{transactionStrings.available}</Label>
        <Label style={[styles.balance, balance < 0 && styles.redBalance]}>
          {formatDecimalDigits(balance, delimiter, decimal)}
        </Label>
      </View>
      <View style={styles.row}>
        <Label style={styles.label}>{transactionStrings.income}</Label>
        <Label style={styles.transactions}>{formatDecimalDigits(income, delimiter, decimal)}</Label>
      </View>
      <View style={styles.row}>
        <Label style={styles.label}>{transactionStrings.expenses}</Label>
        <Label style={styles.transactions}>
          {formatDecimalDigits(expense, delimiter, decimal)}
        </Label>
      </View>
      <AppActivityIndicator isLoading={isLoading || selectedWalletLoading} />
      <MonthlyChart date={selectedMonth} />
    </ShadowBoxView>
  );
};

export default MonthlyBalance;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      marginVertical: 20,
      paddingVertical: 16,
      borderRadius: 10,
      overflow: "hidden",
    },
    titleContainer: {
      marginBottom: 15,
    },
    title: {
      fontSize: 25,
      fontWeight: "bold",
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
      color: theme.colors.redDark,
    },
    label: {
      fontSize: 18,
      color: theme.colors.muted,
    },
    transactions: {
      fontSize: 28,
      textAlign: "right",
      fontWeight: "bold",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      alignItems: "center",
    },
    walletName: {
      fontSize: 25,
      fontWeight: "bold",
      paddingBottom: 5,
      paddingLeft: 30,
    },
  });
