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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showLeftButton && (
          <TouchableOpacity onPress={onBack} style={styles.iconLeft}>
            {renderText(backText)}
          </TouchableOpacity>
        )}

        <Label numberOfLines={1} style={styles.title}>
          {title}
        </Label>

        {showRightButton && (
          <TouchableOpacity onPress={onNext} style={styles.iconRight}>
            {renderText(nextText)}
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
      paddingBottom: 16,
      backgroundColor: theme.colors.card,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    title: {
      textAlign: "center",
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    subtitle: {
      paddingTop: 4,
      color: theme.colors.muted,
      paddingHorizontal: 16,
    },
    iconLeft: {
      position: "absolute",
      left: 16,
      top: 0,
      bottom: 0,
      justifyContent: "center",
    },
    iconRight: {
      position: "absolute",
      right: 16,
      top: 0,
      bottom: 0,
      justifyContent: "center",
    },
    text: {
      color: theme.colors.hyperlink,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default SheetHeader;
