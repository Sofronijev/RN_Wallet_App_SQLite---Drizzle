import { Keyboard, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import StyledLabelInput from "components/StyledLabelInput";
import InputErrorLabel from "components/InputErrorLabel";
import DatePickerInput from "app/features/balance/ui/TransactionForm/DatePickerInput";
import TransactionBottomSheet from "../TransactionBottomSheet";
import { Category, Transaction } from "modules/transactionCategories";
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

type Props = {
  navigation: StackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, "Transaction">;
};

const TransactionForm: React.FC<Props> = ({ navigation, route }) => {
  const editData = route.params?.editData;
  const sheetRef = useRef<TransactionBottomSheetType>(null);
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);

  const wallets = [];
  const selectedWallet = {};
  const walletId = selectedWallet?.walletId;
  const userId = selectedWallet?.userId;

  const onTransactionSubmit = async (values: TransactionFromInputs) => {
    Keyboard.dismiss();
    try {
      if (values.type && values.category && values.walletId && userId) {
        const transactionData = {
          amount: formatFormAmountValue(values.amount, values.category.id, values.type.id),
          description: values.description,
          date: formatIsoDate(values.date),
          type_id: values.type.id,
          categoryId: values.category.id,
          wallet_id: Number(values.walletId),
          user_id: userId,
        };

        if (editData) {
        } else {
          // todo
        }
        navigation.goBack();
      }
    } catch (error) {
      handleTransactionError(error);
    }
  };

  const onDeleteTransaction = async () => {
    try {
      if (editData) {
        // todo
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
    if (sheetRef?.current) {
      Keyboard.dismiss();
      sheetRef?.current?.openSheet();
    }
  };

  const formik = useFormik<TransactionFromInputs>({
    initialValues: { ...initialTransactionFormValues, walletId: `${walletId}` },
    validationSchema: transactionValidationSchema,
    validateOnChange: hasSubmittedForm,
    onSubmit: onTransactionSubmit,
    enableReinitialize: true,
  });

  const pickedWallet = wallets.find((wallet) => wallet.walletId === +formik.values.walletId);

  const walletName = pickedWallet?.walletName;
  const walletCurrency = pickedWallet?.currencySymbol || pickedWallet?.currencyCode;

  useEffect(() => {
    if (editData) {
      const { id, ...data } = editData;
      formik.setValues(data);
      navigation.setOptions({
        title: transactionStrings.editTransaction,
        headerRight: () => (
          <HeaderIcon onPress={onDelete}>
            <Ionicons name='trash-sharp' size={24} color={colors.white} />
          </HeaderIcon>
        ),
      });
    }
  }, [editData]);

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

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        <DatePickerInput
          date={new Date(formik.values.date)}
          maximumDate={new Date()}
          onDateSelect={onDateChange}
        />
        <StyledLabelInput
          value={formattedAmount}
          placeholder='Amount'
          onChangeText={formik.handleChange("amount")}
          keyboardType='decimal-pad'
          style={styles.input}
          icon={<FontAwesome5 name='coins' size={24} color={colors.greenMint} />}
          autoFocus={!editData}
          rightText={walletCurrency}
        />
        <InputErrorLabel text={formik.errors.amount} isVisible={!!formik.errors.amount} />
        <View style={styles.flexRow}>
          <View style={styles.flex}>
            <TouchableOpacity onPress={openSheet}>
              <StyledLabelInput
                value={setCategoryText()}
                icon={<MaterialIcons name='category' size={24} color={colors.greenMint} />}
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
          <View style={styles.flex}>
            <WalletPicker value={walletName} style={styles.input} onSelect={onWalletSelect} />
            <InputErrorLabel text={formik.errors.walletId} isVisible={!!formik.errors.walletId} />
          </View>
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
      <AppActivityIndicator isLoading={false} />
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
    columnGap: 10,
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
});
