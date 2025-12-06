import React, { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import SheetModal from "../components/SheetModal";
import Label from "components/Label";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import CustomButton from "components/CustomButton";
import colors from "constants/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
};

const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const Button: FC<PropsWithChildren<{ onPress: () => void }>> = ({ children, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.buttonContainer}>
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

const NumericKeyboard: FC<Props> = ({ onSetAmount, initialValue, onDismiss, title, subtitle }) => {
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
    const parseNumber = parseFloat(input.replace(decimal, "."));
    sheetRef?.current?.close();
    onSetAmount(parseNumber);
  };

  return (
    <SheetModal sheetRef={sheetRef} snapPoints={snapPoints} onDismiss={onDismiss}>
      <SheetHeader title={title ?? numericKeyboardStrings.setAmount} subtitle={subtitle} />
      <View style={styles.container}>
        <Label style={styles.input}>{formatNumber(input, delimiter, decimal)}</Label>
        <View style={styles.numbers}>
          {numbers.map((number) => (
            <Button onPress={() => onNumberPress(number)} key={number}>
              <Label style={styles.buttonText}>{number}</Label>
            </Button>
          ))}
          <Button onPress={onDecimal}>
            <Label style={styles.buttonText}>{decimal}</Label>
          </Button>
          <Button onPress={() => onNumberPress("0")}>
            <Label style={styles.buttonText}>{0}</Label>
          </Button>
          <Button onPress={onBackSpace}>
            <MaterialIcons name='backspace' size={24} color='black' />
          </Button>
        </View>
        <CustomButton onPress={onSave} title={numericKeyboardStrings.setAmount} />
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
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.grey3,
    borderRadius: 20,
  },
  buttonContainer: {
    padding: 12,
    flexBasis: "33.33%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 28,
  },
});

export default NumericKeyboard;
