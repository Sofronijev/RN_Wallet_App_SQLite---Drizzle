import { PressableStateCallbackType, StyleProp, ViewStyle } from "react-native";

const PRESSED_OPACITY = 0.7;

export const pressableOpacityStyle =
  (style?: StyleProp<ViewStyle>) =>
  ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> =>
    [style, pressed && { opacity: PRESSED_OPACITY }];
