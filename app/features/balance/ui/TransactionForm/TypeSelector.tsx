import { FlatList, ListRenderItem, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import colors from "constants/colors";
import Label from "components/Label";
import { Type } from "db";

type Props = {
  selected: number | undefined;
  onSelect: (type: Type | undefined) => void;
  types: Type[];
};

const TypeSelector: React.FC<Props> = ({ types, selected, onSelect }) => {
  const renderItem: ListRenderItem<Type> = ({ item }) => {
    const isSelected = selected === item.id;
    const onPress = () => onSelect(!isSelected ? item : undefined);

    return (
      <TouchableOpacity
        style={[
          styles.type,
          isSelected && {
            backgroundColor: colors.greenLight,
          },
        ]}
        onPress={onPress}
      >
        <Label>
          <Label style={styles.text}>{`${item.name}`}</Label>
        </Label>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={types}
        horizontal
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 8 }}
      />
    </View>
  );
};

export default TypeSelector;

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  type: {
    borderColor: colors.grey4,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 4,
    justifyContent: "center",
  },
  text: {
    fontSize: 15,
  },
});
