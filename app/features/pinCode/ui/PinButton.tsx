import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React, { FC, ReactElement } from "react";
import { useColors } from "app/theme/useThemedStyles";

type Props = {
  item: number | string | ReactElement;
  onPress: () => void;
};

const PinButton: FC<Props> = ({ item, onPress }) => {
  const colors = useColors();
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={[styles.text, { color: colors.text }]}>{item}</Text>
    </TouchableOpacity>
  );
};

export default PinButton;

const styles = StyleSheet.create({
  container: {
    height: 100,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 44,
  },
});
