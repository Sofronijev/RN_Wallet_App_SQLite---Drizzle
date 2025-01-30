import { Switch } from "react-native";
import React, { FC } from "react";
import colors from "constants/colors";

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const AppSwitch: FC<Props> = ({ value, onValueChange }) => (
  <Switch
    trackColor={{ false: colors.grey, true: colors.greenMint }}
    thumbColor={value ? colors.money : colors.white}
    onValueChange={onValueChange}
    value={value}
  />
);

export default AppSwitch;
