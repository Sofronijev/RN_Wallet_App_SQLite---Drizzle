import React, { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import createSheet from "../createSheet";
import useSheetData from "../useSheetData";
import SheetModal from "../components/SheetModal";
import Label from "components/Label";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import CustomButton from "components/CustomButton";
import colors from "constants/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { numericKeyboardStrings } from "constants/strings";
import SheetHeader from "../components/SheetHeader";
import { tapHaptic } from "modules/haptics";

const snapPoints = ["50%"];

type Data = {
  onSetAmount: (amount: number) => void;
  initialValue?: number;
};

const [emitter, openNumericKeyboard, closeNumericKeyboard] = createSheet<Data>();

export { openNumericKeyboard };

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

const NumericKeyboard: FC = () => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const sheetData = useSheetData<Data>(emitter, sheetRef);
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const setInitialValue = (value: number | undefined) =>
    value ? `${value}`.replace(".", decimal) : "";

  const [input, setInput] = useState<string>(setInitialValue(sheetData?.initialValue));

  useEffect(() => {
    if (sheetData) {
      setInput(setInitialValue(sheetData.initialValue));
    }
  }, [sheetData?.initialValue]);

  const onNumberPress = (value: string) => {
    tapHaptic();
    setInput((prev) => {
      const next = prev + value;

      // ako već postoji decimala i pokušava da doda više od 2
      const decimalIndex = next.indexOf(decimal);
      if (decimalIndex !== -1) {
        const decimalsCount = next.length - decimalIndex - 1;
        if (decimalsCount > 2) return prev; // blokiraj dodavanje
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

  const clearInput = () => setInput(setInitialValue(sheetData?.initialValue));

  const onSave = () => {
    const parseNumber = parseFloat(input.replace(decimal, "."));
    sheetData?.onSetAmount(parseNumber);
    closeNumericKeyboard();
  };

  return (
    <SheetModal sheetRef={sheetRef} snapPoints={snapPoints} onDismiss={clearInput}>
      <SheetHeader title={numericKeyboardStrings.setAmount} />
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
