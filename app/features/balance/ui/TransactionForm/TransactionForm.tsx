import { Keyboard, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import StyledLabelInput from "components/StyledLabelInput";
import InputErrorLabel from "components/InputErrorLabel";
import DatePickerInput from "app/features/balance/ui/TransactionForm/DatePickerInput";
import { MaterialIcons } from "@expo/vector-icons";
import { formatIsoDate } from "modules/timeAndDate";
import AppActivityIndicator from "components/AppActivityIndicator";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import {
  TransactionFromInputs,
  transactionValidationSchema,
} from "../../modules/transactionFormValidation";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import HeaderIcon from "components/Header/HeaderIcon";
import {
  deleteTransactionAlert,
  formatFormAmountValue,
  handleTransactionError,
} from "../../modules/transaction";
import { transactionStrings } from "constants/strings";
import CustomButton from "components/CustomButton";
import WalletPicker from "./WalletPicker";
import { getCategoryIcon } from "components/CategoryIcon";
import { Type, TransactionWithDetails } from "db";
import {
  addTransactionMutation,
  deleteTransactionMutation,
  editTransactionMutation,
  useGetTransactionByIdQuery,
} from "app/queries/transactions";
import { useGetSelectedWalletQuery, useGetWalletsWithBalance } from "app/queries/wallets";
import { ScrollView } from "react-native-gesture-handler";
import Label from "components/Label";
import TypeSelector from "./TypeSelector";
import { useGetCategories } from "app/queries/categories";
import ShadowBoxView from "components/ShadowBoxView";
import AmountInput from "../AmountInput";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import colors from "constants/colors";

type Props = {
  navigation: StackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, "Transaction">;
};

const TransactionForm: React.FC<Props> = ({ navigation, route }) => {
  const editTransactionId = route.params?.id;
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const { data: selectedWallet } = useGetSelectedWalletQuery();
  const { data: editedTransaction } = useGetTransactionByIdQuery(editTransactionId);
  const { data: wallets } = useGetWalletsWithBalance();
  const { categoriesById } = useGetCategories();
  const { addTransaction } = addTransactionMutation();
  const { editTransaction } = editTransactionMutation();
  const { deleteTransaction } = deleteTransactionMutation();
  const isLoading = (!!editTransactionId && !editedTransaction) || !wallets.length;
  const dateRef = useRef(new Date());
  const { openSheet } = useActionSheet();
  const styles = useThemedStyles(themeStyles);
  const { primary } = useColors();

  const onTransactionSubmit = async (values: TransactionFromInputs) => {
    Keyboard.dismiss();
    if (values.category && values.walletId) {
      const transactionData = {
        amount: formatFormAmountValue(values.amount, values.category.id, values.type?.id),
        description: values.description,
        date: formatIsoDate(values.date),
        type_id: values.type?.id ?? null,
        categoryId: values.category.id,
        wallet_id: Number(values.walletId),
      };
      if (editTransactionId) {
        editTransaction({ id: editTransactionId, transaction: transactionData });
      } else {
        addTransaction(transactionData);
      }
      navigation.goBack();
    }
  };

  const onDeleteTransaction = async () => {
    try {
      if (editTransactionId) {
        deleteTransaction(editTransactionId);
      }
      navigation.goBack();
    } catch (error) {
      handleTransactionError(error);
    }
  };

  const onDelete = async () => {
    Keyboard.dismiss();
    deleteTransactionAlert(onDeleteTransaction);
  };

  const formatEditInitialValues = (transaction: TransactionWithDetails) => {
    return {
      date: formatIsoDate(transaction.date),
      amount: Math.abs(transaction.amount),
      description: transaction.description ?? "",
      category: transaction.category,
      type: transaction.type,
      walletId: `${transaction.wallet_id}`,
    };
  };
  const { values, setFieldValue, errors, handleSubmit, handleChange } =
    useFormik<TransactionFromInputs>({
      initialValues: editedTransaction
        ? formatEditInitialValues(editedTransaction)
        : {
            date: formatIsoDate(dateRef.current),
            amount: 0,
            description: "",
            category: null,
            type: null,
            walletId: `${selectedWallet?.walletId}`,
          },
      validationSchema: transactionValidationSchema,
      validateOnChange: hasSubmittedForm,
      onSubmit: onTransactionSubmit,
      enableReinitialize: true,
    });

  const pickedWallet = wallets.find((wallet) => wallet.walletId === +values.walletId);
  const walletCurrency = pickedWallet?.currencySymbol || pickedWallet?.currencyCode;

  useEffect(() => {
    if (editedTransaction) {
      navigation.setOptions({
        title: transactionStrings.editTransaction,
        headerRight: () => (
          <HeaderIcon onPress={onDelete}>
            <Ionicons name='trash-sharp' size={24} color={colors.white} />
          </HeaderIcon>
        ),
      });
    }
  }, [editedTransaction]);

  useEffect(() => {
    if (!editTransactionId) {
      showAmountSheet();
    }
  }, [editTransactionId]);

  const typeOptions = values.category?.id ? categoriesById[values.category.id]?.types ?? [] : [];

  // Zbog problema sa validacijom dodao sam async/await, da bi se sacekala promena
  const onSelectCategory = async (categoryId: number) => {
    console.log("categoryId", categoryId);
    const category = categoriesById[categoryId];
    console.log(category);
    await setFieldValue("category", category);
    const type = category.id === 12 ? categoriesById[category.id].types[0] : null;
    await setFieldValue("type", type, hasSubmittedForm);
  };

  const showCategoriesSheet = () => {
    Keyboard.dismiss();
    openSheet({
      type: SHEETS.CATEGORY_PICKER,
      props: {
        onSelect: onSelectCategory,
        initialSelected: values.category?.id,
        showNewCategoryButton: true,
      },
    });
  };

  const onSetAmount = (amount: number) => {
    setFieldValue("amount", amount, hasSubmittedForm);
    if (!values.category?.id) {
      showCategoriesSheet();
    }
  };

  const showAmountSheet = () => {
    Keyboard.dismiss();
    openSheet({
      type: SHEETS.NUMERIC_KEYBOARD,
      props: {
        onSetAmount: onSetAmount,
        initialValue: values.amount || editedTransaction?.amount,
        showOperators: true,
      },
    });
  };

  const onSelectType = (type: Type | undefined) => {
    setFieldValue("type", type);
  };

  const onDateChange = (date: string) => {
    setFieldValue("date", date);
  };

  const onWalletSelect = (walletId: number) => {
    setFieldValue("walletId", walletId);
  };

  const onSubmit = () => {
    setHasSubmittedForm(true);
    handleSubmit();
  };

  const getCategoryInputIcon = values.category ? (
    getCategoryIcon({
      color: values.category.iconColor,
      iconFamily: values.category.iconFamily,
      name: values.category.iconName,
      iconSize: 40,
    })
  ) : (
    <MaterialIcons name='category' size={40} color={primary} />
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps='always'>
      <View style={styles.inputsContainer}>
        <DatePickerInput date={new Date(values.date ?? undefined)} onDateSelect={onDateChange} />
        <View style={styles.walletPicker}>
          <WalletPicker wallets={wallets} selected={+values.walletId} onSelect={onWalletSelect} />
          <InputErrorLabel text={errors.walletId} isVisible={!!errors.walletId} />
        </View>
        <AmountInput
          onPress={showAmountSheet}
          style={styles.input}
          amount={values.amount}
          walletCurrency={walletCurrency}
        />
        <InputErrorLabel text={errors.amount} isVisible={!!errors.amount} />
        <ShadowBoxView style={[styles.input, styles.paddingVertical]}>
          <TouchableOpacity onPress={showCategoriesSheet} style={styles.flexRow}>
            <View style={styles.icon}>{getCategoryInputIcon}</View>
            <Label style={[styles.label, !values.category?.name && styles.placeHolder]}>
              {values.category?.name ?? "Select category"}
            </Label>
          </TouchableOpacity>
          <TypeSelector types={typeOptions} onSelect={onSelectType} selected={values.type?.id} />
        </ShadowBoxView>
        <InputErrorLabel text={errors.category} isVisible={!!errors.category} />
        <InputErrorLabel text={errors.type} isVisible={!!errors.type} />
        <StyledLabelInput
          placeholder='Transaction comment'
          style={styles.input}
          maxLength={300}
          value={values.description}
          onChangeText={handleChange("description")}
        />
        <CustomButton title='Submit' onPress={onSubmit} style={styles.button} />
      </View>
      <AppActivityIndicator hideScreen isLoading={isLoading} />
    </ScrollView>
  );
};

export default TransactionForm;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: 20,
    },
    inputsContainer: {
      marginHorizontal: 16,
      marginBottom: 40,
    },
    flexRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 8,
    },
    flex: {
      flex: 1,
    },
    input: {
      marginTop: 20,
    },
    button: {
      marginTop: 20,
    },
    walletPicker: {
      paddingTop: 20,
    },
    paddingVertical: {
      paddingVertical: 10,
    },
    icon: {
      width: 45,
    },
    label: { fontSize: 18, flex: 1 },
    placeHolder: { color: theme.colors.placeholder },
  });
