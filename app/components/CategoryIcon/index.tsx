import { StyleSheet, View } from "react-native";
import React, { memo } from "react";
import FontAwesome from "@react-native-vector-icons/fontawesome/static";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5/static";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons/static";
import Ionicons from "@react-native-vector-icons/ionicons/static";
import colors from "constants/colors";
import { CategoriesWithType } from "db";
import { addColorOpacity } from "modules/colorHelper";

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

  // FontAwesome5 free icons live in the "solid" style; without this it defaults
  // to "regular" and warns noSuchGlyph for solid-only names (e.g. balance-scale).
  const fontAwesome5Style = iconFamily === "FontAwesome5" ? { iconStyle: "solid" as const } : {};

  return (
    <IconComponent
      name={name}
      size={iconSize ?? ICON_SIZE}
      color={color ?? colors.white}
      {...fontAwesome5Style}
    />
  );
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

  const IconComponent = getCategoryIcon({
    iconFamily,
    name,
    color,
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
          backgroundColor: addColorOpacity(color, 0.15),
          borderColor: addColorOpacity(color, 0.3),
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
    borderWidth: 1,
  },
});
