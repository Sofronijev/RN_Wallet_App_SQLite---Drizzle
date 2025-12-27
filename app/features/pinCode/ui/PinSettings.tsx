import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import AppSwitch from "components/AppSwitch";
import Label from "components/Label";
import ButtonText from "components/ButtonText";
import { Ionicons } from "@expo/vector-icons";
import AlertPrompt from "components/AlertPrompt";
import { hideValues, isNumber } from "modules/numbers";
import {
  useGetPinCodeDataQuery,
  useSetInactivePinTimeoutMutation,
  useSetIsPinEnabledMutation,
  useSetPinCodeMutation,
} from "app/queries/user";
import VisibilityToggleIcon from "components/VisibilityToggleIcon";
import { pinInactivityOptions } from "../modules";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";

const pinTimeData = Object.values(pinInactivityOptions);

const formatPinInactivityLabel = (val: number | null) => {
  const data = pinInactivityOptions[val ?? 0];

  return data ? data.label : "Never";
};

const PinSettings = () => {
  const { pinCode, isPinEnabled, inactivePinTimeout } = useGetPinCodeDataQuery();
  const { setPinCode } = useSetPinCodeMutation();
  const { setIsPinEnabled } = useSetIsPinEnabledMutation();
  const { setInactivePinTimeout } = useSetInactivePinTimeoutMutation();
  const [showPin, setShowPin] = useState(false);
  const { openSheet } = useActionSheet();
  const styles = useThemedStyles(themeStyles);
  const { danger } = useColors();

  const formatPinCode = showPin ? pinCode : hideValues(pinCode);

  const toggleSwitch = (isEnabled: boolean) => {
    if (isEnabled && !pinCode) {
      onSetPin(true);
    }
    setIsPinEnabled(isEnabled);
  };

  const onEyePress = (isVisible: boolean) => {
    setShowPin(isVisible);
  };

  const onSetPin = (initialSetup?: boolean) => {
    AlertPrompt.prompt(
      "Set Your PIN",
      "Please create a PIN between 4 and 8 digits.\nOnly numbers are allowed (no symbols or decimals).\n\nMake sure to write it down or save it safely. If you lose it, you won’t be able to reset it, and all your data will be lost.",
      [
        {
          onPress: () => (initialSetup ? setIsPinEnabled(false) : undefined),
          label: "Cancel",
          type: "cancel",
        },

        { onPress: (text) => setPinCode(text ?? ""), label: "OK" },
      ],
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

  const onSelectPinTime = (value: number | null) => {
    setInactivePinTimeout(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.warningRow}>
        <Ionicons name='warning-outline' size={30} color={danger} />
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
        <ButtonText
          title={"Change PIN"}
          type='link'
          onPress={() => onSetPin()}
          disabled={!formatPinCode}
        />
        <View style={styles.pinCode}>
          <Label>{formatPinCode || "Not set"}</Label>
          {!!formatPinCode && <VisibilityToggleIcon isVisible={showPin} onPress={onEyePress} />}
        </View>
      </View>
      <ButtonText disabled={!pinCode} title={"Remove PIN"} type='link' onPress={onDeletePin} />
      <View style={styles.row}>
        <Label>{"Lock PIN after inactivity:"}</Label>
        <ButtonText
          title={formatPinInactivityLabel(inactivePinTimeout)}
          type='link'
          onPress={() =>
            openSheet({
              type: SHEETS.PICKER_SHEET,
              props: {
                data: pinTimeData,
                onSelect: onSelectPinTime,
                title: "Select time",
              },
            })
          }
        />
      </View>
    </View>
  );
};

export default PinSettings;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
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
      borderColor: theme.colors.danger,
      padding: 8,
    },
    warning: {
      color: theme.colors.muted,
      flex: 1,
    },
    pinCode: {
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
    },
  });
