import { StyleSheet, View } from "react-native";
import React, { memo } from "react";
import { FontAwesome, FontAwesome5, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import colors from "constants/colors";
import { CategoriesWithType } from "db";

const ICON_SIZE = 28;

type Props = {
  iconFamily: CategoriesWithType["iconFamily"];
  name: string;
  color: string;
  iconSize?: number;
};

const iconMap: Record<string, any> = {
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
};

export const getCategoryIcon = ({ iconFamily, name, iconSize, color }: Props) => {
  const IconComponent = iconMap[iconFamily];

  return <IconComponent name={name} size={iconSize ?? ICON_SIZE} color={color} />;
};

const CategoryIcon: React.FC<Props> = ({ iconSize, iconFamily, name, color }) => {
  const IconComponent = getCategoryIcon({ iconFamily, iconSize, color: colors.white, name });
  if (!IconComponent) {
    return null;
  }

  return <View style={[styles.container, { backgroundColor: color }]}>{IconComponent}</View>;
};

export default memo(CategoryIcon);

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    padding: 7,
  },
});
