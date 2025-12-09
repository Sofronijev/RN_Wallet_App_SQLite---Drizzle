import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

type SheetHeaderProps = {
  onBack?: () => void;
  backText?: React.ReactElement | string;
  onNext?: () => void;
  nextText?: React.ReactElement | string;
  title: string;
  subtitle?: string;
};

const SheetHeader: React.FC<SheetHeaderProps> = ({
  onBack,
  backText,
  onNext,
  nextText,
  title,
  subtitle,
}) => {
  const styles = useThemedStyles(themeStyles);

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
    <View style={styles.container}>
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
      {subtitle && <Label style={styles.subtitle}>{subtitle}</Label>}
    </View>
  );
};

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      backgroundColor: theme.colors.card
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    title: {
      textAlign: "center",
      fontSize: 20,
      fontWeight: "600",
      flex: 2,
      color: theme.colors.text,
    },
    subtitle: {
      paddingTop: 4,
      color: theme.colors.muted,
    },
    icon: {
      flex: 1,
      minWidth: 10,
    },
    text: {
      color: theme.colors.hyperlink,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default SheetHeader;
