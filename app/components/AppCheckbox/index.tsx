import React from "react";
import { Checkbox, CheckboxProps } from "expo-checkbox";
import { useColors } from "app/theme/useThemedStyles";

type Props = {
  isChecked?: boolean;
  setChecked?: ((value: boolean) => void) | undefined;
} & Omit<CheckboxProps, "value" | "onValueChange">;

const AppCheckbox: React.FC<Props> = ({ isChecked, setChecked, ...props }) => {
  const colors = useColors();
  return (
    <Checkbox
      value={isChecked}
      onValueChange={setChecked}
      color={isChecked ? colors.primary : undefined}
      {...props}
    />
  );
};

export default AppCheckbox;
