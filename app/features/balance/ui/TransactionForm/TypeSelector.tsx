import { FlatList, ListRenderItem, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useEffect, useRef } from "react";
import Label from "components/Label";
import { Type } from "db";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { useAddTypeMutation } from "app/queries/types";
import AlertPrompt from "components/AlertPrompt";
import colors from "constants/colors";

type Props = {
  selected?: number | undefined;
  onSelect?: (type: Type | undefined) => void;
  types: Type[];
  categoryId: number;
  disableSelect?: boolean;
  showAddNewButton?: boolean;
};

type AddButton = {
  id: 0;
  name: "+ Add";
};

const isAddButtonType = (obj: Type | AddButton): obj is AddButton => {
  return obj?.id === 0 && obj?.name === "+ Add";
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
  const listRef = useRef<FlatList<Type | AddButton>>(null);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [types]);

  if (!categoryId) return null;

  const typesData: (Type | AddButton)[] = showAddNewButton
    ? [
        ...types,
        {
          id: 0,
          name: "+ Add",
        },
      ]
    : types;

  const onAddNew = () => {
    AlertPrompt.prompt("Add new subcategory name", null, (name: string) => {
      addType({ categoryId, name });
    });
  };

  const renderItem: ListRenderItem<Type | AddButton> = ({ item, index }) => {
    const isSelected = selected === item.id;
    const isAddButton = showAddNewButton && isAddButtonType(item);

    const onPress = () => {
      if (isAddButton) {
        onAddNew();
      } else if ("type" in item) {
        onSelect?.(!isSelected ? item : undefined);
      }
    };

    return (
      <TouchableOpacity
        style={[styles.type, isSelected && styles.selected, isAddButton && styles.addButton]}
        onPress={onPress}
        disabled={disableSelect}
        activeOpacity={0.7}
      >
        <Label style={[styles.text, isAddButton && styles.addButtonText]}>{item.name}</Label>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        key={categoryId}
        ref={listRef}
        data={typesData}
        horizontal
        renderItem={renderItem}
        keyExtractor={(item) => `type-${item.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
    listContent: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 8,
    },
    separator: {
      width: 8,
    },
    type: {
      borderColor: theme.colors.border,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.cardInner,
      flexDirection: "row",
      gap: 6,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    text: {
      fontSize: 14,
      fontWeight: "500",
    },
    selected: {
      backgroundColor: theme.colors.selected,
      borderColor: theme.colors.primary,
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    addButtonText: {
      color: theme.colors.muted,
      fontWeight: "600",
    },
    addButton: {
      backgroundColor: theme.colors.card,
      borderStyle: "dashed",
      borderWidth: 1.5,
    },
  });
