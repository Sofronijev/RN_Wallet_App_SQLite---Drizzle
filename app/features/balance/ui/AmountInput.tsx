import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import React, { FC } from "react";
import Label from "components/Label";
import { formatDecimalDigits } from "modules/numbers";
import colors from "constants/colors";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import ShadowBoxView from "components/ShadowBoxView";

type Props = {
  amount: number;
  onPress: () => void;
  walletCurrency?: string | null;
  style?: StyleProp<ViewStyle>;
  placeholder?: string;
};

const AmountInput: FC<Props> = ({ amount, onPress, walletCurrency, style, placeholder }) => {
  const { decimal, delimiter } = useGetNumberSeparatorQuery();

  return (
    <ShadowBoxView style={[styles.container, style]}>
      <TouchableOpacity style={styles.flexRow} onPress={onPress}>
        <View style={styles.icon}>
          <FontAwesome5 name='coins' size={30} color={colors.greenMint} />
        </View>
        <Label style={[styles.label, !amount && styles.placeHolder]}>
          {amount
            ? `${formatDecimalDigits(amount, delimiter, decimal)} ${walletCurrency ?? ""}`
            : placeholder ?? "Enter amount"}
        </Label>
      </TouchableOpacity>
    </ShadowBoxView>
  );
};

export default AmountInput;

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  icon: {
    width: 40,
  },
  label: { fontSize: 18, flex: 1 },
  placeHolder: { color: colors.grey4 },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
});
