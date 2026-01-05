import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import DatePickerInput from "app/features/balance/ui/TransactionForm/DatePickerInput";
import InputErrorLabel from "components/InputErrorLabel";
import WalletPicker from "app/features/balance/ui/TransactionForm/WalletPicker";
import CustomButton from "components/CustomButton";
import colors from "constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { AppStackParamList } from "navigation/routes";
import Label from "components/Label";
import { transferStrings } from "constants/strings";
import { useGetWalletsWithBalance, WalletType } from "app/queries/wallets";
import { formatInitialTransferEditData, transactionValidationSchema } from "../../modules/transfer";
import {
  addTransferMutation,
  deleteTransferMutation,
  editTransferMutation,
  useGetTransferByIdQuery,
} from "app/queries/transfers";
import HeaderIcon from "components/Header/HeaderIcon";
import AppActivityIndicator from "components/AppActivityIndicator";
import { formatIsoDate } from "modules/timeAndDate";
import AmountInput from "../AmountInput";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

export type TransferFromInputs = {
  date: string;
  amountTo: number;
  amountFrom: number;
  walletIdTo: string;
  walletIdFrom: string;
};

const getWalletById = (wallets: WalletType[], walletId: number | null) =>
  wallets.find((wallet) => wallet.walletId === walletId);

const TransferForm: React.FC = () => {
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const { params } = useRoute<RouteProp<AppStackParamList, "TransferForm">>();
  const { walletId, editTransferId } = params;
  const { addTransfer } = addTransferMutation();
  const { editTransfer } = editTransferMutation();
  const { deleteTransfer } = deleteTransferMutation();
  const navigation = useNavigation();
  const { data: wallets } = useGetWalletsWithBalance();
  const { data: editTransferData, isLoading: isFetchingEditData } =
    useGetTransferByIdQuery(editTransferId);
  const dateRef = useRef(new Date());
  const { openSheet } = useActionSheet();
  const styles = useThemedStyles(themeStyles);

  useEffect(() => {
    if (editTransferData) {
      navigation.setOptions({
        title: transferStrings.editTransfer,
        headerRight: () => (
          <HeaderIcon onPress={onDelete}>
            <Ionicons name='trash-sharp' size={24} color={colors.white} />
          </HeaderIcon>
        ),
      });
    }
  }, [editTransferData]);

  const onTransferSubmit = async (values: TransferFromInputs) => {
    Keyboard.dismiss();
    const transferData = {
      date: values.date,
      walletIdFrom: Number(values.walletIdFrom),
      amountFrom: -Math.abs(Number(values.amountFrom)),
      walletIdTo: Number(values.walletIdTo),
      amountTo: Math.abs(Number(values.amountTo)),
    };

    if (
      editTransferData &&
      editTransferData.fromTransactionId &&
      editTransferData.toTransactionId
    ) {
      const { id, fromTransactionId, toTransactionId } = editTransferData;
      editTransfer({
        ...transferData,
        fromTransactionId: fromTransactionId,
        toTransactionId: toTransactionId,
        transferId: id,
      });
    } else {
      addTransfer(transferData);
    }
    navigation.goBack();
  };

  const onDelete = async () => {
    if (
      editTransferData &&
      editTransferData.toTransactionId &&
      editTransferData.fromTransactionId
    ) {
      deleteTransfer({
        transferId: editTransferData.id,
        fromTransactionId: editTransferData.fromTransactionId,
        toTransactionId: editTransferData.toTransactionId,
      });
      navigation.goBack();
    }
  };

  const { values, setFieldValue, handleSubmit, handleChange, errors } =
    useFormik<TransferFromInputs>({
      initialValues: editTransferData
        ? formatInitialTransferEditData(editTransferData)
        : {
            date: formatIsoDate(dateRef.current),
            amountTo: 0,
            amountFrom: 0,
            walletIdTo: "",
            walletIdFrom: `${walletId}`,
          },
      validationSchema: transactionValidationSchema,
      validateOnChange: hasSubmittedForm,
      onSubmit: (values) => onTransferSubmit(values),
      enableReinitialize: true,
    });
  const walletFrom = getWalletById(wallets, +values.walletIdFrom);
  const walletTo = getWalletById(wallets, +values.walletIdTo);

  const isDifferentCurrency = walletTo && walletFrom?.currencyCode !== walletTo?.currencyCode;

  const onDateChange = (date: string) => {
    setFieldValue("date", date);
  };

  const onWalletSelect = (fieldName: string) => (walletId: number) => {
    setFieldValue(fieldName, walletId);
  };

  const onSubmit = () => {
    setHasSubmittedForm(true);
    handleSubmit();
  };

  const openNumericKeyboard = (onSetAmount: (amount: number) => void, initialValue: number) => {
    Keyboard.dismiss();
    openSheet({
      type: SHEETS.NUMERIC_KEYBOARD,
      props: { onSetAmount, initialValue, showOperators: true },
    });
  };

  const onSetAmountFrom = (amount: number) => {
    setFieldValue("amountFrom", amount);
    if (!isDifferentCurrency) {
      setFieldValue("amountTo", amount);
    }
  };

  const onSetAmountTo = (amount: number) => {
    setFieldValue("amountTo", amount);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex}
    >
      <ScrollView style={styles.container}>
        <View style={styles.inputContainer}>
          <DatePickerInput date={new Date(values.date)} onDateSelect={onDateChange} />
          <View>
            <Label style={styles.transferText}>Transfer from</Label>
            <WalletPicker
              wallets={wallets}
              selected={+values.walletIdFrom}
              onSelect={onWalletSelect("walletIdFrom")}
            />
          </View>
          <View>
            <Label style={styles.transferText}>Transfer to</Label>
            <WalletPicker
              wallets={wallets}
              selected={+values.walletIdTo}
              onSelect={onWalletSelect("walletIdTo")}
            />
          </View>
          <AmountInput
            onPress={() => openNumericKeyboard(onSetAmountFrom, values.amountFrom)}
            amount={values.amountFrom}
            walletCurrency={walletFrom?.currencySymbol || walletFrom?.currencyCode}
            placeholder={isDifferentCurrency ? "Amount from" : "Enter Amount"}
          />
          {isDifferentCurrency && (
            <AmountInput
              onPress={() => openNumericKeyboard(onSetAmountTo, values.amountTo)}
              amount={values.amountTo}
              walletCurrency={walletTo?.currencySymbol || walletTo?.currencyCode}
              placeholder='Amount to'
            />
          )}
        </View>
        {isDifferentCurrency && (
          <Label style={styles.differentCurrency}>
            The currencies between wallets do not match. Please manually enter both amounts for the
            transfer.
          </Label>
        )}
        <InputErrorLabel
          text={errors.amountTo || errors.amountFrom}
          isVisible={!!errors.amountTo || !!errors.amountFrom}
        />
        <InputErrorLabel
          text={errors.walletIdFrom || errors.walletIdTo}
          isVisible={!!errors.walletIdFrom || !!errors.walletIdTo}
        />
        <CustomButton title='Submit' onPress={onSubmit} style={styles.submitBtn} />
      </ScrollView>
      <AppActivityIndicator isLoading={isFetchingEditData} hideScreen />
    </KeyboardAvoidingView>
  );
};

export default TransferForm;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: theme.colors.background },
    container: {
      paddingHorizontal: 16,
      paddingTop: 20,
      flex: 1,
    },
    inputContainer: {
      gap: 20,
    },
    transferText: {
      fontWeight: "bold",
      paddingBottom: 4,
    },
    submitBtn: {
      marginTop: 20,
    },
    differentCurrency: {
      paddingTop: 5,
      color: theme.colors.muted,
      fontSize: 13,
      textAlign: "justify",
    },
  });
