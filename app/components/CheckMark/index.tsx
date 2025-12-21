import { View, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import colors from "constants/colors";
import { useColors } from "app/theme/useThemedStyles";

type Props = {
  size?: number;
  position?: { top?: number; bottom?: number; left?: number; right?: number };
};

const CheckMark: React.FC<Props> = ({ size = 30, position }) => {
  const { primary } = useColors();
  return (
    <View style={[styles.checkmark, { ...position }]}>
      <Ionicons name='checkmark-circle' size={size} color={primary} />
    </View>
  );
};

export default CheckMark;

const styles = StyleSheet.create({
  checkmark: {
    position: "absolute",
    top: 35,
    right: 10,
    backgroundColor: colors.white,
    borderRadius: 15,
  },
});
