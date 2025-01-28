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

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.icon}>
        {!!backText && onBack && renderText(backText)}
      </TouchableOpacity>
      <Label style={styles.title}>{title}</Label>
      <TouchableOpacity onPress={onNext} style={styles.icon}>
        {!!nextText && onNext && renderText(nextText)}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  header: {
    backgroundColor: colors.grey3,
    height: HEADER_TEXT_HEIGH,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  icon: {
    flex: 1,
  },
  text: {
    color: colors.hyperlink,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SheetHeader;
