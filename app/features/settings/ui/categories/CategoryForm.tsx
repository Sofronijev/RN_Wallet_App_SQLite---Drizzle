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
      <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={styles.container}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={openIconsSheet}>
              <CategoryIcon
                color={values.iconColor}
                iconFamily={values.iconFamily}
                name={values.iconName}
                iconSize={50}
                plain
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.colorContainer} onPress={openColorsSheet}>
              <View style={[{ backgroundColor: values.iconColor }, styles.colorBox]}></View>
            </TouchableOpacity>
          </View>

          <View style={styles.flex}>
            <StyledLabelInput
              value={values.name}
              onChangeText={handleChange("name")}
              placeholder={categoryStrings.categoryPlaceholder}
            />
            <InputErrorLabel text={errors.name} isVisible={!!errors.name} />
          </View>
        </View>
        <TwoOptionSelector
          selected={values.transactionType}
          left={transactionType.income}
          right={transactionType.expense}
          onChange={onChangeTransactionType}
        />
        {isTransactionTypeChanged && (
          <Label style={styles.infoLabel}>
            This change applies to future transactions only. Previously recorded transactions will
            remain unchanged.
          </Label>
        )}
        <View style={styles.typesContainer}>
          <TouchableOpacity style={styles.row} onPress={() => onAddType()}>
            <Label style={styles.subCat}>Subcategories</Label>
            <MaterialIcons name='add' size={25} color={muted} />
          </TouchableOpacity>

          {!!values.types?.length &&
            values.types.map((type) => {
              const id = type.id || type.tempId;
              return (
                <View key={id} style={styles.type}>
                  <TouchableOpacity onPress={() => onEditType(id, type.name)} style={styles.flex}>
                    <Label>{type.name}</Label>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDeleteType(id)}>
                    <MaterialIcons name='close' size={20} color={muted} />
                  </TouchableOpacity>
                </View>
              );
            })}
        </View>
        <CustomButton title='Save' onPress={onSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CategoryForm;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingVertical: 24,
      paddingHorizontal: 16,
      flexGrow: 1,
    },
    row: {
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
      paddingBottom: 24,
    },
    flex: {
      flex: 1,
    },
    iconContainer: {
      backgroundColor: theme.colors.cardInner,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      width: 100,
      alignItems: "center",
      gap: 8,
    },
    type: {
      backgroundColor: theme.colors.cardInner,
      borderRadius: 8,
      marginVertical: 4,
      padding: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    typesContainer: {
      paddingVertical: 24,
    },
    colorBox: {
      height: 30,
      width: 100,
    },
    colorContainer: {
      overflow: "hidden",
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
    subCat: {
      fontWeight: "600",
      color: theme.colors.muted,
    },
    infoLabel: {
      paddingTop: 8,
      color: theme.colors.muted,
    },
  });
