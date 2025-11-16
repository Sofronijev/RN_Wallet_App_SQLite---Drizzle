import { FlatList, ListRenderItem, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import colors from "constants/colors";
import Label from "components/Label";
import { WalletType } from "app/queries/wallets";

type Props = {
  selected: number;
  onSelect: (walletId: number) => void;
  wallets: WalletType[];
};

const WalletPicker: React.FC<Props> = ({ wallets, selected, onSelect }) => {
  const renderItem: ListRenderItem<WalletType> = ({ item }) => {
    const isSelected = selected === item.walletId;
    const onPress = () => onSelect(item.walletId);
    const currency = item.currencySymbol || item.currencyCode;
    return (
      <TouchableOpacity
        style={[
          styles.walletContainer,
          { borderColor: item.color },
          isSelected && {
            backgroundColor: colors.greenLight,
          },
        ]}
        onPress={onPress}
      >
        <Label>
          <Label style={styles.text}>{`${item.walletName}`}</Label>
          {currency && <Label>{` (${currency})`}</Label>}
        </Label>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={wallets}
        horizontal
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default WalletPicker;

const styles = StyleSheet.create({
  container: {
    height: 40,
  },
  walletContainer: {
    borderColor: colors.grey3,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    justifyContent: "center",
  },
  text: {
    fontSize: 15,
  },
});
