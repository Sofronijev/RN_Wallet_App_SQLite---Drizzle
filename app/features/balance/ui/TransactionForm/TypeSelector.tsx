import { FlatList, ListRenderItem, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import Label from "components/Label";
import { Type } from "db";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { useAddTypeMutation } from "app/queries/types";
import AlertPrompt from "components/AlertPrompt";

type Props = {
  selected?: number | undefined;
  onSelect?: (type: Type | undefined) => void;
  types: Type[];
  categoryId: number;
  disableSelect?: boolean;
  showAddNewButton?: boolean;
};

const TypeSelector: React.FC<Props> = ({
  types,
  categoryId,
  selected,
  onSelect,
  disableSelect,
  showAddNewButton,
}) => {
  const styles = useThemedStyles(themeStyles);
  const { addType } = useAddTypeMutation();

  if (!categoryId) return null;

  const typesData: Type[] = showAddNewButton
    ? [...types, { id: 0, name: "+ Add", type: "system", categoryId }]
    : types;

  const onAddNew = () => {
    AlertPrompt.prompt("Add new subcategory name", null, (name: string) => {
      addType({ categoryId, name });
    });
  };

  const renderItem: ListRenderItem<Type> = ({ item }) => {
    const isSelected = selected === item.id;
    const isAddButton = showAddNewButton && item.id === 0;
    const onPress = () => (isAddButton ? onAddNew() : onSelect?.(!isSelected ? item : undefined));

    return (
      <TouchableOpacity
        style={[styles.type, isSelected && styles.selected, isAddButton && styles.addButton]}
        onPress={onPress}
        disabled={disableSelect}
      >
        <Label>
          <Label style={[styles.text, isAddButton && styles.addButtonText]}>{`${item.name}`}</Label>
        </Label>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={typesData}
        horizontal
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 8 }}
      />
    </View>
  );
};

export default TypeSelector;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingTop: 8,
    },
    type: {
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 4,
      justifyContent: "center",
      backgroundColor: theme.colors.cardInner,
    },
    text: {
      fontSize: 15,
    },
    selected: {
      backgroundColor: theme.colors.selected,
    },
    addButtonText: {
      color: theme.colors.muted,
    },
    addButton: {
      backgroundColor: theme.colors.card,
    },
  });
