import { Ionicons } from "@expo/vector-icons";
import React from "react";
import HeaderIcon from "components/HeaderIcon";
import colors from "constants/colors";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";

const TransactionFiltersIcon = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const openFilters = () => navigation.navigate("TransactionFilters");

  return (
    <HeaderIcon onPress={openFilters}>
      <Ionicons name='filter' size={24} color={colors.white} />
    </HeaderIcon>
  );
};

export default TransactionFiltersIcon;
