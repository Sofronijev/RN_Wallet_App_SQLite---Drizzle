import { StyleSheet, Text, View } from "react-native";
import React, { FC, useState } from "react";
import colors from "constants/colors";
import PinButton from "./PinButton";
import Feather from "@expo/vector-icons/Feather";
import { usePinCodeStatus } from "./PinCodeStatusProvider";
import { useGetPinCodeDataQuery } from "app/queries/user";

const PinScreen: FC = () => {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const { closePinScreen } = usePinCodeStatus();
  const { pinCode } = useGetPinCodeDataQuery();
  const currentPinLength = pin.length;
  const savedPinLength = pinCode.length;
  const pinDots = Array(savedPinLength).fill(0);

  const clearPinError = () => {
    if (pinError) {
      setPinError(false);
    }
  };

  const onNumberPress = (num: number) => () => {
    const nextPin = pin + `${num}`;
    if (currentPinLength < savedPinLength) {
      clearPinError();
      setPin(nextPin);
    }

    // new Pin will not be set yet so need to add +1 manually
    if (currentPinLength + 1 === savedPinLength) {
      if (nextPin === pinCode) {
        closePinScreen();
        setPin("");
      } else {
        setPin("");
        setPinError(true);
      }
    }
  };

  const onDelete = () => {
    clearPinError();
    setPin((prevPin) => prevPin.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Unlock with pin code</Text>
        <View style={styles.pinContainer}>
          {pinDots.map((item, index) => (
            <View
              key={item + index}
              style={[styles.pin, index < currentPinLength && styles.fillPin]}
            ></View>
          ))}
        </View>
        <Text style={styles.pinError}>{pinError ? "The PIN you entered is incorrect." : ""}</Text>
      </View>

      <View>
        <View style={styles.buttonRow}>
          {[1, 2, 3].map((number) => {
            return <PinButton key={number} onPress={onNumberPress(number)} item={number} />;
          })}
        </View>
        <View style={styles.buttonRow}>
          {[4, 5, 6].map((number) => {
            return <PinButton key={number} onPress={onNumberPress(number)} item={number} />;
          })}
        </View>
        <View style={styles.buttonRow}>
          {[7, 8, 9].map((number) => {
            return <PinButton key={number} onPress={onNumberPress(number)} item={number} />;
          })}
        </View>
        <View style={[styles.buttonRow, { justifyContent: "flex-end" }]}>
          <PinButton onPress={onNumberPress(0)} item={0} />
          <PinButton
            onPress={onDelete}
            item={<Feather name='delete' size={40} color={colors.black} />}
          />
        </View>
      </View>
    </View>
  );
};

export default PinScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
  },
  pinContainer: {
    flexDirection: "row",
    gap: 20,
    paddingTop: 50,
    paddingBottom: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  pin: {
    borderWidth: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: colors.greenMint,
  },
  fillPin: {
    backgroundColor: colors.greenMint,
  },
  pinError: {
    textAlign: "center",
    color: colors.danger,
  },
});
