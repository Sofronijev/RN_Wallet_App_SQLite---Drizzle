import { StyleSheet, View } from "react-native";
import React, { memo } from "react";
import { FontAwesome, FontAwesome5, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import colors from "constants/colors";
import { CategoriesWithType } from "db";

const ICON_SIZE = 28;

type Props = {
  iconFamily: CategoriesWithType["iconFamily"];
  name: string;
  color?: string;
  iconSize?: number;
  plain?: boolean;
};

const iconMap: Record<string, any> = {
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
};

export const getCategoryIcon = ({ iconFamily, name, iconSize, color }: Props) => {
  const IconComponent = iconMap[iconFamily];

  return <IconComponent name={name} size={iconSize ?? ICON_SIZE} color={color ?? colors.white} />;
};

const DEFAULT_CONTAINER_SIZE = 50;
const ICON_SCALE = 0.6;

const CategoryIcon: React.FC<Props> = ({
  iconFamily,
  name,
  color = colors.white,
  iconSize,
  plain,
}) => {
  const finalIconSize = iconSize ?? DEFAULT_CONTAINER_SIZE * ICON_SCALE;
  const containerSize = Math.max(DEFAULT_CONTAINER_SIZE, finalIconSize / ICON_SCALE);

  const iconColor = plain ? color : colors.white;

  const IconComponent = getCategoryIcon({
    iconFamily,
    name,
    color: iconColor,
    iconSize: finalIconSize,
  });

  if (!IconComponent) return null;

  if (plain) {
    return IconComponent;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: color,
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
        },
      ]}
    >
      {IconComponent}
    </View>
  );
};

export default memo(CategoryIcon);

const styles = StyleSheet.create({
  container: {
    width: DEFAULT_CONTAINER_SIZE,
    height: DEFAULT_CONTAINER_SIZE,
    borderRadius: DEFAULT_CONTAINER_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 7,
  },
});
