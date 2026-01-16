import { StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import AppSwitch from "components/AppSwitch";
import Label from "components/Label";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
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
import ShadowBoxView from "components/ShadowBoxView";
import { addColorOpacity } from "modules/colorHelper";

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
  const { danger, muted } = useColors();

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
      "Please create a PIN between 4 and 8 digits.\nOnly numbers are allowed (no symbols or decimals).\n\nMake sure to write it down or save it safely. If you lose it, you won't be able to reset it, and all your data will be lost.",
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
      <View style={styles.warningCard}>
        <View style={styles.warningIconContainer}>
          <Ionicons name='warning-outline' size={24} color={danger} />
        </View>
        <View style={styles.warningContent}>
          <Label style={styles.warningTitle}>Important Security Notice</Label>
          <Label style={styles.warningText}>
            Please write down or save your PIN securely. If you lose it, there is no way to reset
            it, and you will lose all your data permanently.
          </Label>
        </View>
      </View>

      <ShadowBoxView style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Feather name='lock' size={18} color={muted} />
            </View>
            <View style={styles.settingTextContainer}>
              <Label style={styles.settingLabel}>Enable PIN Lock</Label>
              <Label style={styles.settingDescription}>Secure your app with a PIN code</Label>
            </View>
          </View>
          <AppSwitch onValueChange={toggleSwitch} value={isPinEnabled} />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => onSetPin()}
          disabled={!formatPinCode}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Feather name='key' size={18} color={muted} />
            </View>
            <View style={styles.settingTextContainer}>
              <Label style={styles.settingLabel}>PIN Code</Label>
              <View style={styles.pinCodeDisplay}>
                <Label style={styles.pinCodeText}>{formatPinCode || "Not set"}</Label>
                {!!formatPinCode && (
                  <VisibilityToggleIcon isVisible={showPin} onPress={onEyePress} />
                )}
              </View>
            </View>
          </View>
          {!!formatPinCode && <Feather name='chevron-right' size={18} color={muted} />}
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.settingRow}
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
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Feather name='clock' size={18} color={muted} />
            </View>
            <View style={styles.settingTextContainer}>
              <Label style={styles.settingLabel}>Auto-Lock Timer</Label>
              <Label style={styles.settingDescription}>Lock after inactivity</Label>
            </View>
          </View>
          <View style={styles.settingRight}>
            <Label style={styles.settingValue}>
              {formatPinInactivityLabel(inactivePinTimeout)}
            </Label>
            <Feather name='chevron-right' size={18} color={muted} />
          </View>
        </TouchableOpacity>
      </ShadowBoxView>

      {!!pinCode && (
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={onDeletePin}
          disabled={!pinCode}
          activeOpacity={0.7}
        >
          <Feather name='trash-2' size={18} color={danger} />
          <Label style={styles.dangerButtonText}>Remove PIN</Label>
        </TouchableOpacity>
      )}
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
      paddingTop: 20,
      gap: 16,
    },
    warningCard: {
      flexDirection: "row",
      backgroundColor: addColorOpacity(theme.colors.danger, 0.15),
      borderRadius: 16,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: addColorOpacity(theme.colors.danger, 0.3),
    },
    warningIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    warningContent: {
      flex: 1,
      gap: 6,
    },
    warningTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.danger,
    },
    warningText: {
      fontSize: 13,
      color: theme.colors.muted,
      lineHeight: 18,
    },
    settingsCard: {
      backgroundColor: theme.colors.card,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 16,
      minHeight: 70,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 12,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    settingTextContainer: {
      flex: 1,
      gap: 4,
    },
    settingLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },
    settingDescription: {
      fontSize: 13,
      color: theme.colors.muted,
    },
    pinCodeDisplay: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 2,
    },
    pinCodeText: {
      fontSize: 14,
      color: theme.colors.muted,
      fontFamily: "monospace",
      letterSpacing: 2,
    },
    settingRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    settingValue: {
      fontSize: 14,
      color: theme.colors.muted,
      fontWeight: "500",
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: 16,
      opacity: 0.3,
    },
    dangerButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: addColorOpacity(theme.colors.danger, 0.15),
      borderRadius: 12,
      paddingVertical: 14,
      gap: 8,
      borderWidth: 1,
      borderColor: addColorOpacity(theme.colors.danger, 0.3),
    },
    dangerButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.danger,
    },
  });
