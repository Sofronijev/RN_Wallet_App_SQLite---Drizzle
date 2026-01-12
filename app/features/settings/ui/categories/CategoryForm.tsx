import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { RouteProp } from "@react-navigation/native";
import {
  useAddCategoryMutation,
  useDeleteCategoryMutation,
  useEditCategoryMutation,
  useGetCategories,
} from "app/queries/categories";
import { useFormik } from "formik";
import { Category, NewCategory } from "db";
import StyledLabelInput from "components/StyledLabelInput";
import { categoryStrings } from "constants/strings";
import CategoryIcon from "components/CategoryIcon";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import TwoOptionSelector from "components/TwoOptionsSelector";
import Label from "components/Label";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import CustomButton from "components/CustomButton";
import InputErrorLabel from "components/InputErrorLabel";
import { colorsArray } from "components/ActionSheet/ColorSheet/sheetColors";
import { IconSheetIcons } from "components/ActionSheet/IconSheet/icons";
import HeaderIcon from "components/Header/HeaderIcon";
import colors from "constants/colors";
import AlertPrompt from "components/AlertPrompt";
import { showDeleteCategoryAlert } from "../../modules";
import { addColorOpacity } from "modules/colorHelper";

type Props = {
  navigation: StackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, "CategoryForm">;
};

type TransactionTypeLabel = "Income" | "Expense" | "Custom";

type TransactionTypeOption = { label: TransactionTypeLabel; value: Category["transactionType"] };

const transactionType: Record<Category["transactionType"], TransactionTypeOption> = {
  income: { label: "Income", value: "income" },
  expense: { label: "Expense", value: "expense" },
  custom: { label: "Expense", value: "custom" },
};

const categorySchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name is too long")
    .required("Name is required"),
  transactionType: Yup.mixed<Category["transactionType"]>().required(),
  iconFamily: Yup.mixed<"FontAwesome" | "FontAwesome5" | "MaterialCommunityIcons" | "Ionicons">()
    .oneOf(
      ["FontAwesome", "FontAwesome5", "MaterialCommunityIcons", "Ionicons"],
      "Invalid icon family"
    )
    .required("Icon family is required"),
  iconName: Yup.string()
    .trim()
    .min(1, "Icon name is required")
    .max(255)
    .required("Icon name is required"),
  iconColor: Yup.string().trim().required("Icon color is required"),
  types: Yup.array().of(
    Yup.object({
      name: Yup.string().trim(),
      id: Yup.number().nullable(),
      type: Yup.mixed<Category["type"]>().oneOf(["custom", "system"]),
      categoryId: Yup.number().nullable(),
      tempId: Yup.number().nullable(),
    })
      .default([])
      .required()
  ),
});

type CategorySchema = Yup.InferType<typeof categorySchema>;

const CategoryForm: React.FC<Props> = ({ navigation, route }) => {
  const editCategoryId = route.params?.id;
  const { categoriesById } = useGetCategories();
  const { addCategory } = useAddCategoryMutation();
  const { editCategory } = useEditCategoryMutation();
  const { deleteCategory } = useDeleteCategoryMutation();

  const categoryToEdit = editCategoryId ? categoriesById[editCategoryId] : null;
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const styles = useThemedStyles(themedStyles);
  const { openSheet } = useActionSheet();
  const { muted } = useColors();

  const initialRandomColor = useMemo(
    () => colorsArray[Math.floor(Math.random() * colorsArray.length)],
    []
  );

  const initialRandomIcon = useMemo(
    () => IconSheetIcons[Math.floor(Math.random() * IconSheetIcons.length)],
    []
  );

  useEffect(() => {
    if (categoryToEdit) {
      navigation.setOptions({
        title: "Edit category",
        headerRight: () => (
          <HeaderIcon onPress={onDeleteCategory}>
            <Ionicons name='trash-sharp' size={24} color={colors.white} />
          </HeaderIcon>
        ),
      });
    }
  }, [categoryToEdit]);

  const onDeleteCategory = () => {
    if (!editCategoryId) return;

    Keyboard.dismiss();
    showDeleteCategoryAlert(() => deleteCategory(editCategoryId));
    navigation.goBack();
  };

  const onCategorySubmit = async (values: CategorySchema) => {
    Keyboard.dismiss();
    const requestData: NewCategory = {
      ...values,
      name: values.name.trim(),
      type: "custom",
      types: values.types ?? [],
    };

    if (editCategoryId) {
      editCategory({
        ...requestData,
        id: editCategoryId,
      });
    } else {
      addCategory(requestData);
    }
    navigation.goBack();
  };

  const { values, setFieldValue, errors, handleSubmit, handleChange } = useFormik<CategorySchema>({
    initialValues: categoryToEdit
      ? {
          iconColor: categoryToEdit.iconColor,
          iconFamily: categoryToEdit.iconFamily,
          iconName: categoryToEdit.iconName,
          name: categoryToEdit.name,
          types: categoryToEdit.types,
          transactionType: categoryToEdit.transactionType,
        }
      : {
          iconColor: initialRandomColor,
          ...initialRandomIcon,
          name: "",
          types: [],
          transactionType: transactionType.expense.value,
        },
    validationSchema: categorySchema,
    validateOnChange: hasSubmittedForm,
    onSubmit: onCategorySubmit,
    enableReinitialize: true,
  });

  const isTransactionTypeChanged = categoryToEdit
    ? categoryToEdit?.transactionType !== values.transactionType
    : false;

  const onSubmit = () => {
    setHasSubmittedForm(true);
    handleSubmit();
  };

  const openColorsSheet = () => {
    Keyboard.dismiss();
    openSheet({
      type: SHEETS.COLOR_PICKER,
      props: {
        onSelect: (color) => {
          setFieldValue("iconColor", color);
        },
        selected: values.iconColor,
      },
    });
  };

  const openIconsSheet = () => {
    Keyboard.dismiss();
    openSheet({
      type: SHEETS.ICON_PICKER,
      props: {
        onSelect: (icon) => {
          setFieldValue("iconFamily", icon.iconFamily);
          setFieldValue("iconName", icon.iconName);
        },
        color: values.iconColor,
        selected: { iconFamily: values.iconFamily, iconName: values.iconName },
      },
    });
  };

  const editTypeName = (oldName: string, id: number) => (newName: string) => {
    if (newName.trim() === oldName.trim()) return;

    setFieldValue(
      "types",
      (values.types ?? []).map((type) => {
        const typeId = type.id || type.tempId;
        return typeId === id ? { ...type, name: newName } : type;
      })
    );
  };

  const onEditType = (typeId: number, name: string) => {
    Keyboard.dismiss();
    AlertPrompt.prompt("Edit subcategory name", null, editTypeName(name, typeId), {
      defaultValue: name,
      placeholder: "Subcategory name",
    });
  };

  const onDeleteType = (id: number) => {
    Keyboard.dismiss();
    setFieldValue(
      "types",
      (values.types ?? []).filter((type) => {
        const typeId = type.id || type.tempId;

        return typeId !== id;
      })
    );
  };

  const onNewTypeName = (name: string) => {
    setFieldValue("types", [
      ...(values.types ?? []),
      {
        categoryId: editCategoryId ? editCategoryId : null,
        name,
        type: "custom",
        id: null,
        tempId: Date.now(),
      },
    ]);
  };

  const onAddType = () => {
    Keyboard.dismiss();
    AlertPrompt.prompt("Create subcategory name", null, onNewTypeName, {
      placeholder: "Subcategory name",
    });
  };

  const onChangeTransactionType = (selected: CategorySchema["transactionType"]) => {
    setFieldValue("transactionType", selected);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainCard}>
          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <TouchableOpacity
                onPress={openIconsSheet}
                style={[styles.iconContainer, { borderColor: values.iconColor + "30" }]}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBackground, { backgroundColor: values.iconColor + "15" }]}>
                  <CategoryIcon
                    color={values.iconColor}
                    iconFamily={values.iconFamily}
                    name={values.iconName}
                    iconSize={36}
                    plain
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.colorPickerButton}
                onPress={openColorsSheet}
                activeOpacity={0.8}
              >
                <View style={[styles.colorBox, { backgroundColor: values.iconColor }]}>
                  <MaterialIcons name='palette' size={16} color={colors.white} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <View>
                <StyledLabelInput
                  value={values.name}
                  onChangeText={handleChange("name")}
                  placeholder={categoryStrings.categoryPlaceholder}
                />
                <InputErrorLabel text={errors.name} isVisible={!!errors.name} />
              </View>
              <TwoOptionSelector
                selected={values.transactionType}
                left={transactionType.income}
                right={transactionType.expense}
                onChange={onChangeTransactionType}
              />
            </View>
          </View>
          {isTransactionTypeChanged && (
            <View style={styles.infoBox}>
              <MaterialIcons name='info-outline' size={16} color={muted} />
              <Label style={styles.infoLabel}>
                Transaction type change applies to future transactions only. Previously recorded
                transactions will remain unchanged.
              </Label>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.subheaderRow}>
            <View style={styles.subheaderLeft}>
              <MaterialIcons name='category' size={20} color={muted} />
              <Label style={styles.sectionLabel}>Subcategories</Label>
              {values.types && values.types.length > 0 && (
                <View style={styles.badge}>
                  <Label style={styles.badgeText}>{values.types.length}</Label>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAddType()}
              activeOpacity={0.7}
            >
              <MaterialIcons name='add' size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          {values.types && values.types.length > 0 ? (
            <View style={styles.typesList}>
              {values.types &&
                values.types.map((type) => {
                  const id = type.id || type.tempId;
                  return (
                    <View key={id} style={styles.typeItem}>
                      <TouchableOpacity
                        onPress={() => onEditType(id, type.name)}
                        style={styles.typeContent}
                        activeOpacity={0.6}
                      >
                        <Label style={styles.typeName}>{type.name}</Label>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => onDeleteType(id)}
                        style={styles.deleteTypeButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialIcons name='close' size={20} color={muted} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name='inventory-2' size={32} color={muted} opacity={0.3} />
              <Label style={styles.emptyText}>No subcategories yet</Label>
              <Label style={styles.emptySubtext}>Tap + to add your first one</Label>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton title='Save' onPress={onSubmit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CategoryForm;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingVertical: 20,
      paddingHorizontal: 16,
      flexGrow: 1,
    },
    flex: {
      flex: 1,
    },
    mainCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    row: {
      flexDirection: "row",
      gap: 16,
      alignItems: "stretch",
    },
    iconWrapper: {
      alignItems: "center",
      gap: 10,
    },
    iconContainer: {
      borderRadius: 16,
      borderWidth: 2,
      overflow: "hidden",
      backgroundColor: theme.colors.cardInner,
    },
    iconBackground: {
      width: 72,
      height: 72,
      alignItems: "center",
      justifyContent: "center",
    },
    colorPickerButton: {
      borderRadius: 8,
      overflow: "hidden",
    },
    colorBox: {
      height: 32,
      width: 72,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    inputWrapper: {
      flex: 1,
      justifyContent: "space-between",
    },
    section: {
      marginBottom: 24,
    },
    sectionLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },
    infoBox: {
      flexDirection: "row",
      gap: 8,
      backgroundColor: theme.colors.cardInner,
      padding: 12,
      borderRadius: 10,
      marginTop: 12,
      alignItems: "flex-start",
    },
    infoLabel: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.muted,
    },
    subheaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    subheaderLeft: {
      flexDirection: "row",
      gap: 8,
      alignContent: "center",
    },
    badge: {
      backgroundColor: addColorOpacity(theme.colors.primary, 0.2),
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 24,
      alignItems: "center",
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    typesList: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    typeItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    typeContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    typeName: {
      fontSize: 15,
      fontWeight: "500",
    },
    deleteTypeButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.cardInner,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 32,
      paddingHorizontal: 24,
      backgroundColor: theme.colors.cardInner,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
    },
    emptyText: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.colors.muted,
      marginTop: 12,
    },
    emptySubtext: {
      fontSize: 13,
      color: theme.colors.muted,
      opacity: 0.7,
      marginTop: 4,
    },
    buttonContainer: {
      marginTop: 8,
      paddingBottom: 16,
    },
  });
