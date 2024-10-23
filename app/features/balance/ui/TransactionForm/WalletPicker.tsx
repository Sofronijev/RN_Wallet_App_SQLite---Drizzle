import {
  FlatList,
  Keyboard,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuOptionCustomStyle,
  renderers,
  MenuTriggerProps,
} from "react-native-popup-menu";
import React from "react";
import StyledLabelInput from "components/StyledLabelInput";
import { Ionicons } from "@expo/vector-icons";
import colors from "constants/colors";

type Props = {
  value: string | undefined;
  style?: StyleProp<TextStyle>;
  onSelect: (walletId: number) => void;
};

const customOptionStyles: MenuOptionCustomStyle = {
  optionText: {
    fontSize: 15,
    padding: 15,
  },
};

const customTriggerStyle: MenuTriggerProps["customStyles"] = {
  TriggerTouchableComponent: TouchableOpacity,
};

const WalletPicker: React.FC<Props> = ({ value, onSelect, style }) => {
  const wallets = [];

  return (
    <View>
      <Menu
        onSelect={onSelect}
        renderer={renderers.Popover}
        rendererProps={{
          placement: "auto",
          preferredPlacement: "bottom",
        }}
      >
        <MenuTrigger customStyles={customTriggerStyle} onPress={Keyboard.dismiss}>
          <StyledLabelInput
            value={value}
            disabled
            style={style}
            // placeholder='Wallet'
            inputStyle={styles.text}
            icon={<Ionicons name='wallet' size={24} color={colors.greenMint} />}
          />
        </MenuTrigger>
        <MenuOptions>
          <FlatList
            data={wallets}
            renderItem={({ item }) => (
              <MenuOption
                text={item.walletName}
                value={item.walletId}
                customStyles={customOptionStyles}
              />
            )}
          />
        </MenuOptions>
      </Menu>
    </View>
  );
};

export default WalletPicker;

const styles = StyleSheet.create({
  text: {
    color: colors.black,
  },
});
