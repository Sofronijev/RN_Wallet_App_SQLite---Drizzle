import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { RouteProp } from "@react-navigation/native";
import {
  useAddCategoryMutation,
  useEditCategoryMutation,
  useGetCategories,
} from "app/queries/categories";
import { useFormik } from "formik";
import colors from "constants/colors";
import { NewCategory } from "db";
import StyledLabelInput from "components/StyledLabelInput";
import { categoryStrings } from "constants/strings";
import CategoryIcon from "components/CategoryIcon";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import TwoOptionSelector from "components/TwoOptionsSelector";
import Label from "components/Label";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import CustomButton from "components/CustomButton";
import InputErrorLabel from "components/InputErrorLabel";

type Props = {
  navigation: StackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, "CategoryForm">;
};

const categorySchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name is too long")
    .required("Name is required"),
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
});

type CategorySchema = Yup.InferType<typeof categorySchema>;

const CategoryForm: React.FC<Props> = ({ navigation, route }) => {
  const editCategoryId = route.params?.id;
  const { categoriesById } = useGetCategories();
  const { addCategory } = useAddCategoryMutation();
  const { editCategory } = useEditCategoryMutation();
  const categoryToEdit = editCategoryId ? categoriesById[editCategoryId] : null;
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const styles = useThemedStyles(themedStyles);
  const { openSheet } = useActionSheet();

  useEffect(() => {
    if (categoryToEdit) {
      navigation.setOptions({
        title: "Edit category",
        // headerRight: () => (
        //   <HeaderIcon onPress={onDelete}>
        //     <Ionicons name='trash-sharp' size={24} color={colors.white} />
        //   </HeaderIcon>
        // ),
      });
    }
  }, [categoryToEdit]);

  const onTransactionSubmit = async (values: CategorySchema) => {
    Keyboard.dismiss();
    const requestData: NewCategory = {
      ...values,
      name: values.name.trim(),
      type: "custom",
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
        }
      : {
          iconColor: colors.white,
          iconFamily: "MaterialCommunityIcons",
          iconName: "shape",
          name: "",
        },
    validationSchema: categorySchema,
    validateOnChange: hasSubmittedForm,
    onSubmit: onTransactionSubmit,
    enableReinitialize: true,
  });

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
          left={{ label: "Income", value: "income" }}
          right={{ label: "Expense", value: "expense" }}
        />
        <View style={styles.typesContainer}>
          <Label style={styles.subCat}>Subcategories</Label>
          {categoryToEdit &&
            categoryToEdit.types.map((type) => {
              return (
                <View key={type.id} style={styles.type}>
                  <Label>{type.name}</Label>
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
    },
    type: {
      backgroundColor: theme.colors.cardInner,
      borderRadius: 8,
      marginVertical: 4,
      padding: 8,
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
      paddingBottom: 8,
      fontWeight: "600",
      color: theme.colors.muted,
    },
  });
