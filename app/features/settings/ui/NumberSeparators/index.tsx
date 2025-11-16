import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { FC, PropsWithChildren } from "react";
import colors from "constants/colors";
import Label from "components/Label";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useGetNumberSeparatorQuery, useSetDecimal, useSetDelimiter } from "app/queries/user";

const Button: FC<PropsWithChildren<{ onPress: () => void; isSelected: boolean }>> = ({
  onPress,
  children,
  isSelected,
}) => {
  return (
    <TouchableOpacity style={[styles.button, isSelected && styles.selected]} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

const NumberSeparators = () => {
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const { setDecimal } = useSetDecimal();
  const { setDelimiter } = useSetDelimiter();
  return (
    <View style={styles.container}>
      <View style={styles.itemContainer}>
        <Label style={styles.label}>Decimal</Label>
        <View style={styles.row}>
          <Button isSelected={"," === decimal} onPress={() => setDecimal(",")}>
            <MaterialCommunityIcons name='comma' size={16} color={colors.black} />
          </Button>
          <Button isSelected={"." === decimal} onPress={() => setDecimal(".")}>
            <Octicons name='dot-fill' size={16} color={colors.black} />
          </Button>
        </View>
      </View>
      <View style={styles.itemContainer}>
        <Label style={styles.label}>Thousand separator</Label>
        <View style={styles.row}>
          <Button isSelected={"." === delimiter} onPress={() => setDelimiter(".")}>
            <Octicons name='dot-fill' size={16} color={colors.black} />
          </Button>
          <Button isSelected={"," === delimiter} onPress={() => setDelimiter(",")}>
            <MaterialCommunityIcons name='comma' size={16} color={colors.black} />
          </Button>
          <Button isSelected={"" === delimiter} onPress={() => setDelimiter("")}>
            <FontAwesome5 name='ban' size={16} color={colors.black} />
          </Button>
        </View>
      </View>
    </View>
  );
};
export default NumberSeparators;

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    flex: 1,
  },
  label: {
    fontSize: 16,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.grey,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
    alignContent: "center",
    alignItems: "center",
  },
  selected: {
    backgroundColor: colors.greenLight,
    borderColor: colors.greenMint,
  },
  buttonLabel: {
    fontSize: 24,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  itemContainer: {
    flexDirection: "row",
    gap: 8,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
});
