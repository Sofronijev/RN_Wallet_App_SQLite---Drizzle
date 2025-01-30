import { StyleSheet, Text, View } from "react-native";
import React, { FC, useState } from "react";
import colors from "constants/colors";
import PinButton from "./PinButton";
import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";

const maxPin = 6;
const pinDots = Array(maxPin).fill(0);

const PinScreen: FC = () => {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const clearPinError = () => {
    if (pinError) {
      setPinError(false);
    }
  };

  const pinLength = pin.length;
  const onNumberPress = (num: number) => () => {
    if (pinLength < maxPin) {
      clearPinError();
      setPin((prevPin) => prevPin + `${num}`);
    }
  };

  const onDelete = () => {
    clearPinError();
    setPin((prevPin) => prevPin.slice(0, -1));
  };

  const onEnter = () => {
    clearPinError();
    if (pin === "123456") {
      navigation.goBack();
    } else {
      setPinError(true);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Unlock with pin code</Text>
        <View style={styles.pinContainer}>
          {pinDots.map((item, index) => (
            <View
              key={item + index}
              style={[styles.pin, index < pinLength && styles.fillPin]}
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
          <PinButton
            onPress={onDelete}
            item={<Feather name='delete' size={40} color={colors.black} />}
          />
          <PinButton onPress={onNumberPress(0)} item={0} />
          <PinButton
            onPress={onEnter}
            item={<Feather name='log-in' size={40} color={colors.black} />}
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
  },
  fillPin: {
    backgroundColor: colors.black,
  },
  pinError: {
    textAlign: "center",
    color: colors.danger,
  },
});
