import { StyleSheet, View } from "react-native";
import React, { memo, useMemo } from "react";
import {
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import colors from "constants/colors";
import { CategoriesWithType } from "db";

const ICON_SIZE = 28;

export const getCategoryIcon = ({
  category,
  iconSize,
  colored,
}: {
  category: string;
  iconSize?: number;
  colored?: boolean;
}) => {
  switch (category) {
    case "income":
      return {
        icon: (
          <FontAwesome
            name='money'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.money : colors.white}
          />
        ),
        backgroundColor: colors.money,
      };
    case "saving":
      return {
        icon: (
          <MaterialCommunityIcons
            name='piggy-bank'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.saving : colors.white}
          />
        ),
        backgroundColor: colors.saving,
      };
    case "gifts":
      return {
        icon: (
          <FontAwesome5
            name='gift'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.gift : colors.white}
          />
        ),
        backgroundColor: colors.gift,
      };
    case "housing":
      return {
        icon: (
          <FontAwesome
            name='home'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.housing : colors.white}
          />
        ),
        backgroundColor: colors.housing,
      };
    case "utilities":
      return {
        icon: (
          <MaterialCommunityIcons
            name='lightbulb-on'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.utilities : colors.white}
          />
        ),
        backgroundColor: colors.utilities,
      };
    case "food":
      return {
        icon: (
          <MaterialCommunityIcons
            name='food-apple'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.food : colors.white}
          />
        ),
        backgroundColor: colors.food,
      };
    case "transportation":
      return {
        icon: (
          <FontAwesome5
            name='car'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.transportation : colors.white}
          />
        ),
        backgroundColor: colors.transportation,
      };
    case "health":
      return {
        icon: (
          <MaterialCommunityIcons
            name='pill'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.health : colors.white}
          />
        ),
        backgroundColor: colors.health,
      };
    case "dailyLiving":
      return {
        icon: (
          <MaterialCommunityIcons
            name='human-greeting'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.dailyLiving : colors.white}
          />
        ),
        backgroundColor: colors.dailyLiving,
      };
    case "children":
      return {
        icon: (
          <MaterialCommunityIcons
            name='baby-carriage'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.children : colors.white}
          />
        ),
        backgroundColor: colors.children,
      };
    case "obligation":
      return {
        icon: (
          <FontAwesome
            name='credit-card'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.obligations : colors.white}
          />
        ),
        backgroundColor: colors.obligations,
      };
    case "entertainment":
      return {
        icon: (
          <Ionicons
            name='happy-outline'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.entertainment : colors.white}
          />
        ),
        backgroundColor: colors.entertainment,
      };
    case "other":
      return {
        icon: (
          <MaterialIcons
            name='attach-money'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.otherCategory : colors.white}
          />
        ),
        backgroundColor: colors.otherCategory,
      };
    case "balanceCorrection":
      return {
        icon: (
          <MaterialCommunityIcons
            name='swap-horizontal-bold'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.transfer : colors.white}
          />
        ),
        backgroundColor: colors.transfer,
      };
    default:
      return {
        icon: (
          <MaterialIcons
            name='attach-money'
            size={iconSize ?? ICON_SIZE}
            color={colored ? colors.otherCategory : colors.white}
          />
        ),
        backgroundColor: colors.otherCategory,
      };
  }
};

type Props = {
  iconFamily: CategoriesWithType["iconFamily"];
  name: string;
  color: string;
  iconSize?: number;
  fillColor?: boolean;
};

const iconMap: Record<string, any> = {
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
};

const CategoryIcon: React.FC<Props> = ({ iconSize, iconFamily, name, color, fillColor }) => {
  const IconComponent = useMemo(() => iconMap[iconFamily], [iconFamily]);

  if (!IconComponent) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <IconComponent
        name={name}
        size={iconSize ?? ICON_SIZE}
        color={fillColor ? color : colors.white}
      />
    </View>
  );
};

export default memo(CategoryIcon);

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    padding: 7,
  },
});
