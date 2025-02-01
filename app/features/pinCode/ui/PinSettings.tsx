import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import AppSwitch from "components/AppSwitch";
import colors from "constants/colors";
import Label from "components/Label";
import ButtonText from "components/ButtonText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AlertPrompt from "components/AlertPrompt";
import { isNumber } from "modules/numbers";
import {
  useGetPinCodeDataQuery,
  useSetIsPinEnabledMutation,
  useSetPinCodeMutation,
} from "app/queries/user";

const PinSettings = () => {
  const { pinCode, isPinEnabled } = useGetPinCodeDataQuery();
  const { setPinCode } = useSetPinCodeMutation();
  const { setIsPinEnabled } = useSetIsPinEnabledMutation();
  const [showPin, setShowPin] = useState(false);

  const formatPinCode = showPin ? pinCode : pinCode.replace(/./g, "*");

  const toggleSwitch = (isEnabled: boolean) => {
    if (isEnabled && !pinCode) {
      onSetPin();
    }
    setIsPinEnabled(isEnabled);
  };

  const onEyePress = () => {
    setShowPin((prevVal) => !prevVal);
  };

  const onSetPin = (canCancel?: boolean) => {
    AlertPrompt.prompt(
      "Set Your PIN",
      "Please create a PIN between 4 and 8 digits. \n\nMake sure to write it down or save it safely. If you lose it, you won’t be able to reset it, and all your data will be lost.",
      canCancel
        ? (text) => setPinCode(text)
        : [{ onPress: (text) => setPinCode(text ?? ""), label: "OK" }],
      {
        validator: (text) => text.length >= 4 && text.length <= 8 && isNumber(text),
        keyboardType: "numeric",
      }
    );
  };

  const onDeletePin = () => {
    if (pinCode) {
      setIsPinEnabled(false);
    }
    setPinCode("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.warningRow}>
        <Ionicons name='warning-outline' size={30} color={colors.danger} />
        <Label style={styles.warning}>
          Please write down or save your PIN securely. If you lose it, there is no way to reset it,
          and you will lose all your data permanently. We cannot recover it for you.
        </Label>
      </View>
      <View style={styles.row}>
        <Label>Enable PIN code</Label>
        <AppSwitch onValueChange={toggleSwitch} value={isPinEnabled} />
      </View>
      <View style={styles.row}>
        <ButtonText title={"Change PIN"} type='link' onPress={() => onSetPin(true)} />
        <View style={styles.pinCode}>
          <Label>{formatPinCode || "Not set"}</Label>
          <TouchableOpacity onPress={onEyePress}>
            {showPin ? (
              <MaterialCommunityIcons name='eye-outline' size={24} color='black' />
            ) : (
              <MaterialCommunityIcons name='eye-off-outline' size={24} color='black' />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ButtonText title={"Remove PIN"} type='link' onPress={onDeletePin} />
    </View>
  );
};

export default PinSettings;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: colors.danger,
    padding: 8,
  },
  warning: {
    color: colors.grey2,
    flex: 1,
  },
  pinCode: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});
