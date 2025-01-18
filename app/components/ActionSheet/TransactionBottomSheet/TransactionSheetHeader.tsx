import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import colors from "constants/colors";
import { HEADER_TEXT_HEIGH } from "app/features/balance/modules/transaction";
import { Category } from "modules/transactionCategories";
import { FontAwesome } from "@expo/vector-icons";
import Label from "components/Label";

type TransactionSheetHeaderProps = {
  onBack: () => void;
  selectedCategory: Category | null;
};

const TransactionSheetHeader: React.FC<TransactionSheetHeaderProps> = ({
  onBack,
  selectedCategory,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.icon}>
        {!!selectedCategory && <FontAwesome name='chevron-left' size={25} color={colors.black} />}
      </TouchableOpacity>
      <Label style={styles.title}>
        {!!selectedCategory ? selectedCategory.label : "Pick category"}
      </Label>
      <Label style={styles.icon}></Label>
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
    paddingBottom: 10,
    justifyContent: "space-between",
  },
  icon: {
    marginLeft: 20,
    width: 30,
  },
});

export default TransactionSheetHeader;
