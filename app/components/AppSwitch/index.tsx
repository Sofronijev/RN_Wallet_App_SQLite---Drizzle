import { Switch } from "react-native";
import React, { FC } from "react";
import { useColors } from "app/theme/useThemedStyles";
import colors from "constants/colors";

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const AppSwitch: FC<Props> = ({ value, onValueChange }) => {
  const themeColors = useColors();
  return (
    <Switch
      trackColor={{ false: themeColors.placeholder, true: themeColors.primary }}
      thumbColor={colors.white}
      onValueChange={onValueChange}
      value={value}
    />
  );
};

export default AppSwitch;
