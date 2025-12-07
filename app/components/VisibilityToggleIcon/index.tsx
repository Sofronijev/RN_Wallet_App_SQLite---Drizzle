import { TouchableOpacity } from "react-native";
import React, { FC } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "constants/colors";
import { useColors } from "app/theme/useThemedStyles";

type Props = {
  isVisible: boolean;
  onPress?: (isVisible: boolean) => void;
};

const VisibilityToggleIcon: FC<Props> = ({ isVisible, onPress }) => {
  const onEyePress = () => onPress?.(!isVisible);
  const { text } = useColors();
  return (
    <TouchableOpacity onPress={onEyePress}>
      {isVisible ? (
        <MaterialCommunityIcons name='eye-outline' size={24} color={text} />
      ) : (
        <MaterialCommunityIcons name='eye-off-outline' size={24} color={text} />
      )}
    </TouchableOpacity>
  );
};

export default VisibilityToggleIcon;
