import { Keyboard, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import * as Yup from "yup";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { RouteProp } from "@react-navigation/native";
import { useAddCategoryMutation, useGetCategories } from "app/queries/categories";
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
  const categoryToEdit = editCategoryId ? categoriesById[editCategoryId] : null;
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const styles = useThemedStyles(themedStyles);
  const { openSheet } = useActionSheet();

  const onTransactionSubmit = async (values: CategorySchema) => {
    Keyboard.dismiss();
    const requestData: NewCategory = {
      ...values,
      type: "custom",
    };
    if (editCategoryId) {
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

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <TouchableOpacity>
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
        </View>
      </View>
      <TwoOptionSelector
        left={{ label: "Income", value: "income" }}
        right={{ label: "Expense", value: "expense" }}
      />
      <View style={styles.typesContainer}>
        {categoryToEdit &&
          categoryToEdit.types.map((type) => {
            return (
              <View style={styles.type}>
                <Label>{type.name}</Label>
              </View>
            );
          })}
      </View>
    </View>
  );
};

export default CategoryForm;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingVertical: 24,
      paddingHorizontal: 16,
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
  });
