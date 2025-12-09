import React, { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { evaluate } from "mathjs";
import SheetModal from "../components/SheetModal";
import Label from "components/Label";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import CustomButton from "components/CustomButton";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { numericKeyboardStrings } from "constants/strings";
import SheetHeader from "../components/SheetHeader";
import { tapHaptic } from "modules/haptics";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";

type Props = {
  onSetAmount: (amount: number) => void;
  initialValue?: number;
  onDismiss?: () => void;
  title?: string;
  subtitle?: string;
  showOperators?: boolean;
};

const Button: FC<PropsWithChildren<{ onPress: () => void; showOperators?: boolean }>> = ({
  children,
  onPress,
  showOperators,
}) => {
  const width = showOperators ? "25%" : "33.33%";
  const styles = useThemedStyles(themeStyles);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.buttonContainer, { width }]}>
      {children}
    </TouchableOpacity>
  );
};

const formatSingle = (rawValue: string, thousandsSeparator: string, decimalSeparator: string) => {
  if (!rawValue) return "0";

  const hasDecimal = rawValue.includes(decimalSeparator);
  const [intPart, decPart] = rawValue.split(decimalSeparator);

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  if (!hasDecimal) return formattedInt;

  return decPart !== undefined
    ? `${formattedInt}${decimalSeparator}${decPart}`
    : `${formattedInt}${decimalSeparator}`;
};

const formatNumber = (rawValue: string, thousandsSeparator: string, decimalSeparator: string) => {
  const numbers = rawValue.split(/([+\-*/])/g).filter((value) => value !== "");
  return (
    numbers
      .map((number) => {
        if (/^[+\-*/]$/.test(number)) return number;
        return formatSingle(number, thousandsSeparator, decimalSeparator);
      })
      .join("") || 0
  );
};

const operators = ["+", "-", "*", "/"];

const NumericKeyboard: FC<Props> = ({
  onSetAmount,
  initialValue,
  onDismiss,
  title,
  subtitle,
  showOperators,
}) => {
  const sheetRef = useRef<BottomSheetModalMethods | null>(null);
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const styles = useThemedStyles(themeStyles);
  const colors = useColors();

  const setInitialValue = (value: number | undefined) =>
    value ? `${value}`.replace(".", decimal) : "";

  const [input, setInput] = useState<string>(setInitialValue(initialValue));

  useEffect(() => {
    setInput(setInitialValue(initialValue));
  }, [initialValue]);

  const onNumberPress = (value: string) => {
    tapHaptic();
    setInput((prev) => {
      const next = prev + value;

      const lastPart = next.split(/[\+\-\*\/]/).pop() || "";

      const decimalIndex = lastPart.indexOf(decimal);
      if (decimalIndex !== -1) {
        const decimalsCount = lastPart.length - 1 - decimalIndex;
        if (decimalsCount > 2) return prev;
      }

      return next;
    });
  };

  const addOperator = (operator: string) => {
    tapHaptic();
    setInput((prev) => {
      const last = prev.slice(-1);

      if (!prev) {
        return operator === "-" ? "-" : prev;
      }

      if (operators.includes(last)) {
        return prev.slice(0, -1) + operator;
      }

      return prev + operator;
    });
  };

  const onBackSpace = () => {
    tapHaptic();
    setInput((prev) => prev.slice(0, -1));
  };

  const onDecimal = () => {
    tapHaptic();

    setInput((prev) => {
      const lastNumber = prev.split(/[\+\-\*\/]/).pop() || "";

      if (lastNumber.includes(decimal)) return prev;

      if (prev === "" || prev === delimiter) {
        return "0" + decimal;
      } else {
        return prev + decimal;
      }
    });
  };

  const onSave = () => {
    let parseNumber = input.replaceAll(decimal, ".");

    const lastChar = parseNumber.slice(-1);
    if (operators.includes(lastChar)) {
      parseNumber = parseNumber.slice(0, -1);
    }

    const result = Number(evaluate(parseNumber));

    sheetRef?.current?.close();
    onSetAmount(result);
  };

  const rawButtons = [
    { label: "1", onPress: () => onNumberPress("1") },
    { label: "2", onPress: () => onNumberPress("2") },
    { label: "3", onPress: () => onNumberPress("3") },
    { icon: "plus", onPress: () => addOperator("+") },

    { label: "4", onPress: () => onNumberPress("4") },
    { label: "5", onPress: () => onNumberPress("5") },
    { label: "6", onPress: () => onNumberPress("6") },
    { icon: "minus", onPress: () => addOperator("-") },

    { label: "7", onPress: () => onNumberPress("7") },
    { label: "8", onPress: () => onNumberPress("8") },
    { label: "9", onPress: () => onNumberPress("9") },
    { icon: "times", onPress: () => addOperator("*") },

    { label: ",", onPress: () => onDecimal() },
    { label: "0", onPress: () => onNumberPress("0") },
    { icon: "backspace", onPress: () => onBackSpace() },
    { icon: "divide", onPress: () => addOperator("/") },
  ];

  const buttons = Array.from({ length: 4 }, (_, i) => rawButtons.slice(i * 4, i * 4 + 4));

  const renderButton = (icon?: string, label?: string) => {
    if (icon) {
      return (
        <FontAwesome5
          name={icon}
          size={24}
          color={icon === "backspace" ? colors.text : colors.primary}
        />
      );
    } else if (label) {
      return <Label style={styles.buttonText}>{label}</Label>;
    }
  };

  return (
    <SheetModal sheetRef={sheetRef} onDismiss={onDismiss}>
      <BottomSheetView style={{ flex: 1 }}>
        <SheetHeader title={title ?? numericKeyboardStrings.setAmount} subtitle={subtitle} />
        <View style={styles.container}>
          <Label numberOfLines={2} style={styles.input}>
            {formatNumber(input, delimiter, decimal)}
          </Label>
          <View style={styles.numbers}>
            {buttons.map((buttonRow, index) => (
              <View key={`${index}`} style={styles.row}>
                {buttonRow.map((button) => (
                  <Button
                    key={`${button.label}-${button.icon}`}
                    showOperators={showOperators}
                    onPress={button.onPress}
                  >
                    {renderButton(button.icon, button.label)}
                  </Button>
                ))}
              </View>
            ))}
          </View>
          <CustomButton onPress={onSave} title={numericKeyboardStrings.confirm} />
        </View>
      </BottomSheetView>
    </SheetModal>
  );
};

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      flex: 1,
      gap: 16,
    },
    input: {
      fontSize: 28,
      textAlign: "right",
    },
    numbers: {
      backgroundColor: theme.colors.cardInner,
      borderRadius: 20,
      paddingVertical: 8,
      gap: 16,
    },
    row: {
      flexDirection: "row",
    },
    buttonContainer: {
      width: "25%",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontSize: 28,
      color: theme.colors.text,
    },
    operator: {
      fontSize: 32,
      color: theme.colors.primary,
      fontWeight: "bold",
    },
  });

export default NumericKeyboard;
