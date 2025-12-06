import React, { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { evaluate } from "mathjs";
import SheetModal from "../components/SheetModal";
import Label from "components/Label";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import CustomButton from "components/CustomButton";
import colors from "constants/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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

  return (
    <SheetModal sheetRef={sheetRef} snapPoints={snapPoints} onDismiss={onDismiss}>
      <SheetHeader title={title ?? numericKeyboardStrings.setAmount} subtitle={subtitle} />
      <View style={styles.container}>
        <Label numberOfLines={2} style={styles.input}>
          {formatNumber(input, delimiter, decimal)}
        </Label>
        <View style={styles.numbers}>
          <View style={styles.row}>
            <Button showOperators={showOperators} onPress={() => onNumberPress("1")}>
              <Label style={styles.buttonText}>1</Label>
            </Button>
            <Button showOperators={showOperators} onPress={() => onNumberPress("2")}>
              <Label style={styles.buttonText}>2</Label>
            </Button>
            <Button showOperators={showOperators} onPress={() => onNumberPress("3")}>
              <Label style={styles.buttonText}>3</Label>
            </Button>
            <Button showOperators={showOperators} onPress={() => addOperator("+")}>
              <FontAwesome5 name='plus' size={24} color={colors.greenMint} />
            </Button>
          </View>

          <View style={styles.row}>
            <Button showOperators={showOperators} onPress={() => onNumberPress("4")}>
              <Label style={styles.buttonText}>4</Label>
            </Button>
            <Button showOperators={showOperators} onPress={() => onNumberPress("5")}>
              <Label style={styles.buttonText}>5</Label>
            </Button>
            <Button showOperators={showOperators} onPress={() => onNumberPress("6")}>
              <Label style={styles.buttonText}>6</Label>
            </Button>
            <Button showOperators={showOperators} onPress={() => addOperator("-")}>
              <FontAwesome5 name='minus' size={24} color={colors.greenMint} />
            </Button>
          </View>

          <View style={styles.row}>
            <Button showOperators={showOperators} onPress={() => onNumberPress("7")}>
              <Label style={styles.buttonText}>7</Label>
            </Button>
            <Button showOperators={showOperators} onPress={() => onNumberPress("8")}>
              <Label style={styles.buttonText}>8</Label>
            </Button>
            <Button showOperators={showOperators} onPress={() => onNumberPress("9")}>
              <Label style={styles.buttonText}>9</Label>
            </Button>
            <Button showOperators={showOperators} onPress={() => addOperator("*")}>
              <FontAwesome5 name='times' size={24} color={colors.greenMint} />
            </Button>
          </View>

          <View style={styles.row}>
            <Button showOperators={showOperators} onPress={onDecimal}>
              <Label style={styles.buttonText}>{decimal}</Label>
            </Button>
            <Button showOperators={showOperators} onPress={() => onNumberPress("0")}>
              <Label style={styles.buttonText}>0</Label>
            </Button>
            <Button showOperators={showOperators} onPress={onBackSpace}>
              <MaterialIcons name='backspace' size={24} color='black' />
            </Button>
            <Button showOperators={showOperators} onPress={() => addOperator("/")}>
              <FontAwesome5 name='divide' size={24} color={colors.greenMint} />
            </Button>
          </View>
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
