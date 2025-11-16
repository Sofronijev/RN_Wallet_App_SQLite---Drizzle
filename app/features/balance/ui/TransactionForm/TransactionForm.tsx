import { Keyboard, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import StyledLabelInput from "components/StyledLabelInput";
import InputErrorLabel from "components/InputErrorLabel";
import DatePickerInput from "app/features/balance/ui/TransactionForm/DatePickerInput";
import { openCategoriesSheet } from "components/ActionSheet/CategoriesSheet";
import colors from "constants/colors";
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
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import HeaderIcon from "components/HeaderIcon";
import {
  deleteTransactionAlert,
  formatFormAmountValue,
  handleTransactionError,
} from "../../modules/transaction";
import { transactionStrings } from "constants/strings";
import CustomButton from "components/CustomButton";
import WalletPicker from "./WalletPicker";
import { getCategoryIcon } from "components/CategoryIcon";
import { Type, TransactionWithDetails, Category } from "db";
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
import { openNumericKeyboard } from "components/ActionSheet/NumbericKeyboard";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { formatDecimalDigits } from "modules/numbers";

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
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const isLoading = (!!editTransactionId && !editedTransaction) || !wallets.length;
  const dateRef = useRef(new Date());

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

  const openSheet = () => {
    Keyboard.dismiss();
    openCategoriesSheet({ onSelect: onSelectCategory });
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
      openAmountInput();
    }
  }, [editTransactionId]);

  const typeOptions = values.category?.id ? categoriesById[values.category.id]?.types ?? [] : [];
  const onSelectCategory = (category: Category) => {
    setFieldValue("category", category);
  };

  const onSetAmount = (amount: number) => {
    setFieldValue("amount", amount);
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

  const openAmountInput = () => {
    Keyboard.dismiss();
    openNumericKeyboard({
      onSetAmount: onSetAmount,
      initialValue: values.amount || editedTransaction?.amount,
    });
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
    <MaterialIcons name='category' size={40} color={colors.greenMint} />
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps='always'>
      <View style={styles.inputsContainer}>
        <DatePickerInput date={new Date(values.date ?? undefined)} onDateSelect={onDateChange} />
        <View style={styles.walletPicker}>
          <WalletPicker wallets={wallets} selected={+values.walletId} onSelect={onWalletSelect} />
          <InputErrorLabel text={errors.walletId} isVisible={!!errors.walletId} />
        </View>
        <ShadowBoxView style={[styles.input, styles.paddingVertical]}>
          <TouchableOpacity style={styles.flexRow} onPress={openAmountInput}>
            <FontAwesome5 name='coins' size={24} color={colors.greenMint} />
            <Label style={styles.amount}>
              {values.amount
                ? `${formatDecimalDigits(values.amount, delimiter, decimal)} ${
                    walletCurrency ?? ""
                  }`
                : "Enter amount"}
            </Label>
          </TouchableOpacity>
        </ShadowBoxView>
        <InputErrorLabel text={errors.amount} isVisible={!!errors.amount} />
        <ShadowBoxView style={[styles.input, styles.paddingVertical]}>
          <TouchableOpacity onPress={openSheet} style={styles.flexRow}>
            <View>{getCategoryInputIcon}</View>
            <Label style={styles.categoryText}>{values.category?.name ?? "Select category"}</Label>
          </TouchableOpacity>
          <TypeSelector types={typeOptions} onSelect={onSelectType} selected={values.type?.id} />
        </ShadowBoxView>
        <InputErrorLabel text={errors.category} isVisible={!!errors.category} />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
  amount: {
    fontSize: 18,
    flex: 1,
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
  categoryText: { fontSize: 18, fontWeight: "400" },
});
