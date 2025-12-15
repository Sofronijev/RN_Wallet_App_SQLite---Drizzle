import { Ionicons } from "@expo/vector-icons";
import React from "react";
import HeaderIcon from "components/HeaderIcon";
import colors from "constants/colors";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { useTransactionFilters } from "./context/TransactionFiltersContext";
import { StyleSheet, View } from "react-native";
import Label from "components/Label";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

const TransactionFiltersIcon = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const { filtersCounter } = useTransactionFilters();
  const styles = useThemedStyles(themedStyles);

  const openFilters = () => navigation.navigate("TransactionFilters");

  return (
    <View>
      <HeaderIcon onPress={openFilters}>
        <Ionicons name='filter' size={24} color={colors.white} />
      </HeaderIcon>
      {!!filtersCounter && (
        <View style={styles.bubble}>
          <Label style={styles.bubbleText}>{filtersCounter}</Label>
        </View>
      )}
    </View>
  );
};

export default TransactionFiltersIcon;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    bubble: {
      position: "absolute",
      top: -6,
      right: -6,
      height: 20,
      width: 20,
      borderRadius: 10,
      backgroundColor: theme.dark ? colors.greenMintDark : colors.white,
      alignItems: "center",
      justifyContent: "center",
    },
    bubbleText: {
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      lineHeight: 12,
    },
  });
