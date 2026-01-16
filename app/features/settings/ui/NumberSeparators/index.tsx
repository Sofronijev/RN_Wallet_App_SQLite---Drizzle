import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { FC, PropsWithChildren } from "react";
import Label from "components/Label";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useGetNumberSeparatorQuery, useSetDecimal, useSetDelimiter } from "app/queries/user";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";

const Button: FC<PropsWithChildren<{ onPress: () => void; isSelected: boolean }>> = ({
  onPress,
  children,
  isSelected,
}) => {
  const styles = useThemedStyles(themeStyles);
  return (
    <TouchableOpacity
      style={[styles.button, isSelected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

const NumberSeparators = () => {
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const { setDecimal } = useSetDecimal();
  const { setDelimiter } = useSetDelimiter();
  const styles = useThemedStyles(themeStyles);
  const { text } = useColors();

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Label style={styles.sectionTitle}>Decimal Separator</Label>
          <Text style={styles.sectionDescription}>Choose your decimal separator</Text>
        </View>
        <View style={styles.buttonGroup}>
          <Button isSelected={"," === decimal} onPress={() => setDecimal(",")}>
            <MaterialCommunityIcons name='comma' size={20} color={text} />
          </Button>
          <Button isSelected={"." === decimal} onPress={() => setDecimal(".")}>
            <Octicons name='dot-fill' size={20} color={text} />
          </Button>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Label style={styles.sectionTitle}>Thousand Separator</Label>
          <Text style={styles.sectionDescription}>Choose your thousand separator</Text>
        </View>
        <View style={styles.buttonGroup}>
          <Button isSelected={"." === delimiter} onPress={() => setDelimiter(".")}>
            <Octicons name='dot-fill' size={20} color={text} />
          </Button>
          <Button isSelected={"," === delimiter} onPress={() => setDelimiter(",")}>
            <MaterialCommunityIcons name='comma' size={20} color={text} />
          </Button>
          <Button isSelected={"" === delimiter} onPress={() => setDelimiter("")}>
            <FontAwesome5 name='ban' size={18} color={text} />
            <Text style={styles.buttonText}>None</Text>
          </Button>
        </View>
      </View>

      <View style={styles.previewSection}>
        <Text style={styles.previewLabel}>Preview:</Text>
        <Text style={styles.previewText}>
          1{delimiter}234{delimiter}567{decimal}89
        </Text>
      </View>
    </View>
  );
};

export default NumberSeparators;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    section: {
      marginBottom: 16,
    },
    sectionHeader: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 4,
      color: theme.colors.text,
    },
    sectionDescription: {
      fontSize: 14,
      color: theme.colors.muted,
      opacity: 0.7,
    },
    buttonGroup: {
      flexDirection: "row",
      gap: 12,
      flexWrap: "wrap",
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minWidth: 60,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    selected: {
      backgroundColor: theme.colors.selected,
      borderColor: theme.colors.primary,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.colors.text,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 8,
    },
    previewSection: {
      marginTop: 32,
      padding: 20,
      backgroundColor: theme.colors.border,
      borderRadius: 12,
      alignItems: "center",
    },
    previewLabel: {
      fontSize: 14,
      color: theme.colors.muted,
      marginBottom: 8,
      fontWeight: "500",
    },
    previewText: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text,
      letterSpacing: 1,
    },
  });
