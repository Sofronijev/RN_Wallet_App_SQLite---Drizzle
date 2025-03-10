import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import colors from "constants/colors";
import Label from "components/Label";

type SheetHeaderProps = {
  onBack?: () => void;
  backText?: React.ReactElement | string;
  onNext?: () => void;
  nextText?: React.ReactElement | string;
  title: string;
};
export const HEADER_TEXT_HEIGH = 35;

const SheetHeader: React.FC<SheetHeaderProps> = ({ onBack, backText, onNext, nextText, title }) => {
  const renderText = (text: React.ReactElement | string) => {
    if (typeof text === "string") {
      return <Label style={styles.text}>{text}</Label>;
    }

    return text;
  };

  const showLeftButton = !!backText && typeof onBack === "function";
  const showRightButton = !!nextText && typeof onNext === "function";
  const showIcons = showLeftButton || showRightButton;

  return (
    <View>
      <View style={styles.header}>
        {showIcons && (
          <TouchableOpacity onPress={onBack} style={styles.icon}>
            {showLeftButton && renderText(backText)}
          </TouchableOpacity>
        )}
        <Label numberOfLines={1} style={styles.title}>
          {title}
        </Label>
        {showIcons && (
          <TouchableOpacity onPress={onNext} style={styles.icon}>
            {showRightButton && renderText(nextText)}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.grey3,
    height: HEADER_TEXT_HEIGH,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  title: {
    textAlign: "center",
    fontSize: 15,
    flex: 2,
    color: colors.dark,
  },
  icon: {
    flex: 1,
    minWidth: 10,
  },
  text: {
    color: colors.hyperlink,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SheetHeader;
