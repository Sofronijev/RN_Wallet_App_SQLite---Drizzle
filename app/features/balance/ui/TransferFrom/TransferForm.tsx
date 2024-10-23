import { Alert, Keyboard, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import DatePickerInput from "app/features/balance/ui/TransactionForm/DatePickerInput";
import { formatIsoDate } from "modules/timeAndDate";
import StyledLabelInput from "components/StyledLabelInput";
import InputErrorLabel from "components/InputErrorLabel";
import WalletPicker from "app/features/balance/ui/TransactionForm/WalletPicker";
import CustomButton from "components/CustomButton";
import colors from "constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";

import AppActivityIndicator from "components/AppActivityIndicator";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { AppStackParamList } from "navigation/routes";
import Label from "components/Label";

import { errorStrings } from "constants/strings";

export type TransferFromInputs = {
  date: string;
  amountTo: string;
  amountFrom: string;
  walletIdTo: string;
  walletIdFrom: string;
};

export const initialTransferFormValues = {
  date: formatIsoDate(new Date()),
  amountTo: "",
  amountFrom: "",
  walletIdTo: "",
  walletIdFrom: "",
};

export const transactionValidationSchema = (isSameCurrency: boolean) =>
  Yup.object({
    date: Yup.string().required().label("Date"),
    amountTo: isSameCurrency
      ? Yup.number()
      : Yup.number()
          .typeError("Please enter a valid number for the amount")
          .required("Please enter the amount to transfer")
          .moreThan(0, "Amount must be greater than 0")
          .label("Amount"),
    amountFrom: Yup.number()
      .typeError("Please enter a valid number for the amount")
      .required("Please enter the amount to transfer")
      .moreThan(0, "Amount must be greater than 0")
      .label("Amount"),
    walletIdTo: Yup.number().required("Please select the wallet").label("Wallet"),
    walletIdFrom: Yup.number()
      .required("Please select the wallet")
      .label("Wallet")
      .test("notEqual", "Can't transfer funds to the same wallet", function (value) {
        const { walletIdTo } = this.parent;
        return value !== walletIdTo;
      }),
  });

const TransferForm: React.FC = () => {
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const [isSameCurrency, setIsSameCurrency] = useState(true);
  const { params } = useRoute<RouteProp<AppStackParamList, "TransferForm">>();
  const walletIdFromParam = params.walletId;
  const editData = params.editData;
  const navigation = useNavigation();
  const wallets = {};
  const userId = 1;

  const onTransferSubmit = async (values: TransferFromInputs) => {
    Keyboard.dismiss();
    try {
      const transferData = {
        date: formatIsoDate(values.date),
        amountTo: isSameCurrency ? Number(values.amountFrom) : Number(values.amountTo),
        amountFrom: Number(values.amountFrom),
        walletIdTo: Number(values.walletIdTo),
        walletIdFrom: Number(values.walletIdFrom),
        userId,
      };

      if (editData) {
      } else {
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert(errorStrings.problem, errorStrings.tryAgain);
    }
  };

  const onDelete = async () => {
    try {
      navigation.goBack();
    } catch (error) {
      Alert.alert(errorStrings.problem, errorStrings.tryAgain);
    }
  };

  const formik = useFormik<TransferFromInputs>({
    initialValues: { ...initialTransferFormValues, walletIdFrom: `${walletIdFromParam}` },
    validationSchema: transactionValidationSchema(isSameCurrency),
    validateOnChange: hasSubmittedForm,
    onSubmit: (values) => onTransferSubmit(values),
  });

  useEffect(() => {
    const walletFrom = {};
    const walletTo = {};
    if (walletFrom && walletTo) {
      setIsSameCurrency(walletFrom?.currencyCode === walletTo?.currencyCode);
    }
  }, [formik.values.walletIdFrom, formik.values.walletIdTo]);

  const onDateChange = (date: string) => {
    formik.setFieldValue("date", date);
  };
  // In case amount is negative, remove minus sign for preview
  // TODO - add validation while typing
  const formattedAmount = (amount: string) => amount.replace("-", "");

  const walletName = (walledValue: string) => "wallets[walledValue]?.walletName";
  const walletCurrency = (walledValue: string) => "currencySymbol ||currencyCode";

  const onWalletSelect = (fieldName: string) => (walletId: number) => {
    formik.setFieldValue(fieldName, walletId);
  };

  const onSubmit = () => {
    setHasSubmittedForm(true);
    formik.handleSubmit();
  };

  return (
    <View style={styles.container}>
      <DatePickerInput
        date={new Date(formik.values.date)}
        maximumDate={new Date()}
        onDateSelect={onDateChange}
      />

      <View style={styles.row}>
        <View style={styles.flex}>
          <StyledLabelInput
            value={formattedAmount(formik.values.amountFrom)}
            placeholder={isSameCurrency ? "Amount" : "Sending"}
            onChangeText={formik.handleChange("amountFrom")}
            keyboardType='decimal-pad'
            style={styles.input}
            icon={<FontAwesome5 name='coins' size={24} color={colors.greenMint} />}
            rightText={walletCurrency(formik.values.walletIdFrom)}
          />
        </View>
        {!isSameCurrency && (
          <View style={styles.flex}>
            <StyledLabelInput
              value={formattedAmount(formik.values.amountTo)}
              placeholder='Receiving'
              onChangeText={formik.handleChange("amountTo")}
              keyboardType='decimal-pad'
              style={styles.input}
              icon={<FontAwesome5 name='coins' size={24} color={colors.greenMint} />}
              rightText={walletCurrency(formik.values.walletIdTo)}
            />
          </View>
        )}
      </View>
      <InputErrorLabel
        text={formik.errors.amountTo || formik.errors.amountFrom}
        isVisible={!!formik.errors.amountTo || !!formik.errors.amountFrom}
      />
      {!isSameCurrency && (
        <Label style={styles.differentCurrency}>
          The currencies between wallets do not match. Please manually enter both amounts for the
          transfer.
        </Label>
      )}
      <View style={styles.row}>
        <View style={styles.flex}>
          <WalletPicker
            value={walletName(formik.values.walletIdFrom)}
            style={styles.input}
            onSelect={onWalletSelect("walletIdFrom")}
          />
        </View>
        <View style={styles.flex}>
          <WalletPicker
            value={walletName(formik.values.walletIdTo)}
            style={styles.input}
            onSelect={onWalletSelect("walletIdTo")}
          />
        </View>
      </View>
      <InputErrorLabel
        text={formik.errors.walletIdFrom || formik.errors.walletIdTo}
        isVisible={!!formik.errors.walletIdFrom || !!formik.errors.walletIdTo}
      />
      <CustomButton title='Submit' onPress={onSubmit} style={styles.submitBtn} />
      <AppActivityIndicator isLoading={false} />
    </View>
  );
};

export default TransferForm;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
    columnGap: 10,
  },
  flex: {
    flex: 1,
  },
  submitBtn: {
    marginTop: 20,
  },
  input: {
    backgroundColor: colors.white,
  },
  differentCurrency: {
    color: colors.grey2,
    fontSize: 13,
  },
});
