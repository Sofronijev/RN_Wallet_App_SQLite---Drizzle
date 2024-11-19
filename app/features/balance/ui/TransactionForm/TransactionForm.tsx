import { Keyboard, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import StyledLabelInput from "components/StyledLabelInput";
import InputErrorLabel from "components/InputErrorLabel";
import DatePickerInput from "app/features/balance/ui/TransactionForm/DatePickerInput";
import TransactionBottomSheet from "../TransactionBottomSheet";
import { Category, Transaction, transactionCategories } from "modules/transactionCategories";
import { TransactionBottomSheetType } from "../../modules/transactionBottomSheet";
import colors from "constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { formatIsoDate } from "modules/timeAndDate";
import AppActivityIndicator from "components/AppActivityIndicator";

import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import {
  initialTransactionFormValues,
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
import {
  addTransaction,
  deleteTransaction,
  editTransaction,
} from "app/services/transactionQueries";
import { getCategoryIcon } from "components/CategoryIcon";
import { TransactionType } from "db";
import { useGetTransactionByIdQuery } from "app/queries/transactions";
import { useGetSelectedWalletQuery, useGetWalletsWithBalance } from "app/queries/wallets";

type Props = {
  navigation: StackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, "Transaction">;
};

const TransactionForm: React.FC<Props> = ({ navigation, route }) => {
  const editTransactionId = route.params?.id;
  const sheetRef = useRef<TransactionBottomSheetType>(null);
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const { data: selectedWallet } = useGetSelectedWalletQuery();
  const { data: editedTransaction } = useGetTransactionByIdQuery(editTransactionId);
  const { data: wallets } = useGetWalletsWithBalance();

  const isLoading = (!!editTransactionId && !editedTransaction) || !wallets.length;

  const onTransactionSubmit = async (values: TransactionFromInputs) => {
    Keyboard.dismiss();
    try {
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
          await editTransaction(editTransactionId, transactionData);
        } else {
          await addTransaction(transactionData);
        }
        navigation.goBack();
      }
      // TODO - FIX Errors (check data from service call)
    } catch (error) {
      handleTransactionError(error);
    }
  };

  const onDeleteTransaction = async () => {
    try {
      if (editTransactionId) {
        await deleteTransaction(editTransactionId);
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

  // TODO - Move sheet to separate component at the parent
  // if screen is set to ScrollView there is a bug, sheet doesn't come from the bottom
  const openSheet = () => {
    if (sheetRef?.current) {
      Keyboard.dismiss();
      sheetRef?.current?.openSheet();
    }
  };

  const formatEditInitialValues = (transaction: TransactionType) => {
    const category = transactionCategories[transaction.categoryId];
    const type = category.types[transaction.type_id];

    return {
      date: formatIsoDate(transaction.date),
      amount: `${Math.abs(transaction.amount)}`,
      description: transaction.description ?? "",
      category,
      type,
      walletId: `${transaction.wallet_id}`,
    };
  };

  const formik = useFormik<TransactionFromInputs>({
    initialValues: editedTransaction
      ? formatEditInitialValues(editedTransaction)
      : { ...initialTransactionFormValues, walletId: `${selectedWallet?.walletId}` },
    validationSchema: transactionValidationSchema,
    validateOnChange: hasSubmittedForm,
    onSubmit: onTransactionSubmit,
    enableReinitialize: true,
  });

  const pickedWallet = wallets.find((wallet) => wallet.walletId === +formik.values.walletId);

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

  const onSelectCategory = (category: Category, type: Transaction) => {
    formik.setFieldValue("category", category);
    formik.setFieldValue("type", type);
  };

  const setCategoryText = () => {
    if (!formik.values.category && !formik.values.type) {
      return "";
    }
    return `${formik.values.category?.label}, ${formik.values.type?.label}`;
  };

  // In case amount is negative, remove minus sign for preview
  // TODO - add validation while typing
  const formattedAmount = formik.values.amount.replace("-", "");

  const onDateChange = (date: string) => {
    formik.setFieldValue("date", date);
  };

  const onWalletSelect = (walletId: number) => {
    formik.setFieldValue("walletId", walletId);
  };

  const onSubmit = () => {
    setHasSubmittedForm(true);
    formik.handleSubmit();
  };

  const getCategoryInputIcon = formik.values.category ? (
    getCategoryIcon({
      type: formik.values.category.name,
      colored: true,
      iconSize: 24,
    }).icon
  ) : (
    <MaterialIcons name='category' size={24} color={colors.greenMint} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        <DatePickerInput
          date={new Date(formik.values.date)}
          maximumDate={new Date()}
          onDateSelect={onDateChange}
        />
        <View style={styles.walletPicker}>
          <WalletPicker
            wallets={wallets}
            selected={+formik.values.walletId}
            onSelect={onWalletSelect}
          />
          <InputErrorLabel text={formik.errors.walletId} isVisible={!!formik.errors.walletId} />
        </View>
        <StyledLabelInput
          value={formattedAmount}
          placeholder='Amount'
          onChangeText={formik.handleChange("amount")}
          keyboardType='decimal-pad'
          style={styles.input}
          icon={<FontAwesome5 name='coins' size={24} color={colors.greenMint} />}
          autoFocus={!editTransactionId}
          rightText={walletCurrency}
        />
        <InputErrorLabel text={formik.errors.amount} isVisible={!!formik.errors.amount} />
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
          <InputErrorLabel
            text={formik.errors.category}
            isVisible={!!formik.errors.category || !!formik.errors.type}
          />
        </View>
        <StyledLabelInput
          placeholder='Transaction comment'
          style={styles.input}
          maxLength={300}
          value={formik.values.description}
          onChangeText={formik.handleChange("description")}
        />
        <CustomButton title='Submit' onPress={onSubmit} style={styles.button} />
      </View>
      <TransactionBottomSheet ref={sheetRef} onSelect={onSelectCategory} />
      <AppActivityIndicator hideScreen isLoading={isLoading} />
    </View>
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
