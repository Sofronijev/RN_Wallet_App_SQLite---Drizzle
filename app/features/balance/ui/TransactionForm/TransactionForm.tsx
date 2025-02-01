import { Keyboard, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
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
  const { addTransaction, isLoading: addTransactionLoading } = addTransactionMutation();
  const { editTransaction } = editTransactionMutation();
  const { deleteTransaction } = deleteTransactionMutation();
  const isLoading = (!!editTransactionId && !editedTransaction) || !wallets.length;

  const onTransactionSubmit = async (values: TransactionFromInputs) => {
    Keyboard.dismiss();
    if (values.type && values.category && values.walletId) {
      const transactionData = {
        amount: formatFormAmountValue(values.amount, values.category.id, values.type.id),
        description: values.description,
        date: formatIsoDate(values.date),
        type_id: values.type.id,
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
      amount: `${Math.abs(transaction.amount)}`,
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
            date: formatIsoDate(new Date()),
            amount: "",
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

  const onSelectCategory = (category: Category, type: Type) => {
    setFieldValue("category", category);
    setFieldValue("type", type);
  };

  const setCategoryText = () => {
    if (!values.category && !values.type) {
      return "";
    }
    return `${values.category?.name}, ${values.type?.name}`;
  };

  // In case amount is negative, remove minus sign for preview
  // TODO - add validation while typing
  const formattedAmount = values.amount.replace("-", "");

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
      iconSize: 24,
    })
  ) : (
    <MaterialIcons name='category' size={24} color={colors.greenMint} />
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps='always'>
      <View style={styles.inputsContainer}>
        <DatePickerInput date={new Date(values.date)} onDateSelect={onDateChange} />
        <View style={styles.walletPicker}>
          <WalletPicker wallets={wallets} selected={+values.walletId} onSelect={onWalletSelect} />
          <InputErrorLabel text={errors.walletId} isVisible={!!errors.walletId} />
        </View>
        <StyledLabelInput
          value={formattedAmount}
          placeholder='Amount'
          onChangeText={handleChange("amount")}
          keyboardType='decimal-pad'
          style={styles.input}
          icon={<FontAwesome5 name='coins' size={24} color={colors.greenMint} />}
          autoFocus={!editTransactionId}
          rightText={walletCurrency}
        />
        <InputErrorLabel text={errors.amount} isVisible={!!errors.amount} />
        <View>
          <TouchableOpacity onPress={openSheet}>
            <StyledLabelInput
              value={setCategoryText()}
              icon={getCategoryInputIcon}
              disabled
              placeholder='Category'
              style={styles.input}
              inputStyle={styles.category}
            />
          </TouchableOpacity>
          <InputErrorLabel text={errors.category} isVisible={!!errors.category || !!errors.type} />
        </View>
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
  },
  flex: {
    flex: 1,
  },
  input: {
    marginTop: 20,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  button: {
    marginTop: 20,
  },
  category: {
    color: colors.black,
  },
  walletPicker: {
    paddingTop: 20,
  },
});
