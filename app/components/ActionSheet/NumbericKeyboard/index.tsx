import React, { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { evaluate } from "mathjs";
import SheetModal from "../components/SheetModal";
import Label from "components/Label";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import CustomButton from "components/CustomButton";
import colors from "constants/colors";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { numericKeyboardStrings } from "constants/strings";
import SheetHeader from "../components/SheetHeader";
import { tapHaptic } from "modules/haptics";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

const snapPoints = ["50%"];

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

  return (
    <TouchableOpacity onPress={onPress} style={[styles.buttonContainer, { width }]}>
      {children}
    </TouchableOpacity>
  );
};

const formatNumber = (rawValue: string, thousandsSeparator: string, decimalSeparator: string) => {
  if (!rawValue) return "0";

  const hasDecimal = rawValue.includes(decimalSeparator);
  const [intPart, decPart] = rawValue.split(decimalSeparator);

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  if (!hasDecimal) return formattedInt;

  return decPart !== undefined
    ? `${formattedInt}${decimalSeparator}${decPart}`
    : `${formattedInt}${decimalSeparator}`;
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

      const decimalIndex = next.indexOf(decimal);
      if (decimalIndex !== -1) {
        const decimalsCount = next.length - decimalIndex - 1;
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
    if (input.includes(decimal)) return;

    if (input === "" || input === delimiter) {
      setInput("0" + decimal);
    } else {
      setInput((prev) => prev + decimal);
    }
  };

  const onSave = () => {
    let parseNumber = input.replace(decimal, ".");

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
      return <FontAwesome5 name={icon} size={24} color={colors.greenMint} />;
    } else if (label) {
      return <Label style={styles.buttonText}>{label}</Label>;
    }
  };

  return (
    <SheetModal sheetRef={sheetRef} snapPoints={snapPoints} onDismiss={onDismiss}>
      <SheetHeader title={title ?? numericKeyboardStrings.setAmount} subtitle={subtitle} />
      <View style={styles.container}>
        <Label numberOfLines={2} style={styles.input}>
          {formatNumber(input, delimiter, decimal)}
        </Label>
        <View style={styles.numbers}>
          {buttons.map((buttonRow) => {
            return (
              <View style={styles.row}>
                {buttonRow.map((button) => {
                  return (
                    <Button showOperators={showOperators} onPress={button.onPress}>
                      {renderButton(button.icon, button.label)}
                    </Button>
                  );
                })}
              </View>
            );
          })}
        </View>
        <CustomButton onPress={onSave} title={numericKeyboardStrings.confirm} />
      </View>
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    gap: 16,
  },
  input: {
    fontSize: 28,
    textAlign: "right",
  },
  numbers: {
    backgroundColor: colors.grey3,
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
  },
  operator: {
    fontSize: 32,
    color: colors.greenMint,
    fontWeight: "bold",
  },
});

export default NumericKeyboard;
