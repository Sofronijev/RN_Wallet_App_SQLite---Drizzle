import { FlatList, ListRenderItem, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import colors from "constants/colors";
import useGetWalletsWithBalance from "../../hooks/useGetWalletsWithBalance";
import Label from "components/Label";
import { WalletType } from "../../modules/types";

type Props = {
  selected: number;
  onSelect: (walletId: number) => void;
};

const WalletPicker: React.FC<Props> = ({ selected, onSelect }) => {
  const wallets = useGetWalletsWithBalance();
  const renderItem: ListRenderItem<WalletType> = ({ item }) => {
    const isSelected = selected === item.walletId;
    const onPress = () => onSelect(item.walletId);
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
        <Label style={styles.text}>{`${item.walletName} (${
          item.currencySymbol || item.currencyCode
        })`}</Label>
      </TouchableOpacity>
    );
  };

  return <FlatList data={wallets} horizontal renderItem={renderItem} />;
};

export default WalletPicker;

const styles = StyleSheet.create({
  walletContainer: {
    borderColor: colors.grey3,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  text: {
    fontSize: 15,
  },
});
