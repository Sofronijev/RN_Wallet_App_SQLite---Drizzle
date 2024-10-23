import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import CategoryIcon from "components/CategoryIcon";
import { Category, Transaction } from "modules/transactionCategories";
import { CATEGORIES_NUMBER_OF_ROWS } from "app/features/balance/modules/transaction";

export const TRANSACTION_ITEM_HEIGHT = 85;
const transactionWidth = 100 / CATEGORIES_NUMBER_OF_ROWS;

type TransactionItemProps = {
  item: Transaction | Category;
  onPress: (item: Transaction | Category) => void;
};

const TransactionItem: React.FC<TransactionItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <View style={styles.icon}>
        <CategoryIcon categoryName={item.name} iconSize={40} />
      </View>
      <Text style={styles.label}>{item.label}</Text>
    </TouchableOpacity>
  );
};
export default TransactionItem;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 5,
    height: TRANSACTION_ITEM_HEIGHT,
    width: `${transactionWidth}%`,
  },
  label: {
    fontSize: 13,
  },
  icon: {},
});
