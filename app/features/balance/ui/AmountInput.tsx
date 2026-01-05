import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import React, { FC } from "react";
import Label from "components/Label";
import { formatDecimalDigits } from "modules/numbers";
import colors from "constants/colors";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import ShadowBoxView from "components/ShadowBoxView";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

type Props = {
  amount: number;
  onPress: () => void;
  walletCurrency?: string | null;
  style?: StyleProp<ViewStyle>;
  placeholder?: string;
  disabled?: boolean;
};

const AmountInput: FC<Props> = ({
  amount,
  onPress,
  walletCurrency,
  style,
  placeholder,
  disabled,
}) => {
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const styles = useThemedStyles(themedStyles);
  return (
    <ShadowBoxView style={[styles.container, style, disabled && styles.disabledContainer]}>
      <TouchableOpacity style={styles.flexRow} onPress={onPress} disabled={disabled}>
        <View style={styles.icon}>
          <FontAwesome5 name='coins' size={30} color={colors.greenMint} />
        </View>
        <Label style={[styles.label, !amount && styles.placeHolder, disabled && styles.disabled]}>
          {amount
            ? `${formatDecimalDigits(amount, delimiter, decimal)} ${walletCurrency ?? ""}`
            : placeholder ?? "Enter amount"}
        </Label>
      </TouchableOpacity>
    </ShadowBoxView>
  );
};

export default AmountInput;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { paddingVertical: 10 },
    disabledContainer: { backgroundColor: theme.colors.disabled },
    icon: {
      width: 40,
    },
    label: { fontSize: 18, flex: 1 },
    placeHolder: { color: theme.colors.placeholder },
    flexRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 8,
    },
    disabled: {
      color: theme.colors.muted,
    },
  });
