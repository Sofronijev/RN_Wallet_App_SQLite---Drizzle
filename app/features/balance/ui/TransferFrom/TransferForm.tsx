import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React, { useState } from "react";
import { useFormik } from "formik";
import DatePickerInput from "app/features/balance/ui/TransactionForm/DatePickerInput";
import StyledLabelInput from "components/StyledLabelInput";
import InputErrorLabel from "components/InputErrorLabel";
import WalletPicker from "app/features/balance/ui/TransactionForm/WalletPicker";
import CustomButton from "components/CustomButton";
import colors from "constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { AppStackParamList } from "navigation/routes";
import Label from "components/Label";
import { errorStrings } from "constants/strings";
import { useGetWalletsWithBalance, WalletType } from "app/queries/wallets";
import { initialTransferFormValues, transactionValidationSchema } from "../../modules/transfer";
import { addTransferMutation } from "app/queries/transfers";

export type TransferFromInputs = {
  date: string;
  amountTo: string;
  amountFrom: string;
  walletIdTo: string;
  walletIdFrom: string;
};
const getWalletById = (wallets: WalletType[], walletId: number | null) =>
  wallets.find((wallet) => wallet.walletId === walletId);

const TransferForm: React.FC = () => {
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const { params } = useRoute<RouteProp<AppStackParamList, "TransferForm">>();
  const { addTransfer } = addTransferMutation();
  const walletIdFromParam = params.walletId;
  const editData = params.editData;
  const navigation = useNavigation();
  const { data: wallets } = useGetWalletsWithBalance();
  const onTransferSubmit = async (values: TransferFromInputs) => {
    Keyboard.dismiss();

    const transferData = {
      date: values.date,
      walletIdFrom: Number(values.walletIdFrom),
      amountFrom: -Math.abs(Number(values.amountFrom)),
      walletIdTo: Number(values.walletIdTo),
      amountTo: Math.abs(Number(values.amountTo)),
    };

    if (editData) {
    } else {
      addTransfer(transferData);
    }

    navigation.goBack();
  };

  const onDelete = async () => {
    try {
      navigation.goBack();
    } catch (error) {
      Alert.alert(errorStrings.problem, errorStrings.tryAgain);
    }
  };

  const { values, setFieldValue, handleSubmit, handleChange, errors } =
    useFormik<TransferFromInputs>({
      initialValues: {
        ...initialTransferFormValues,
        walletIdFrom: `${walletIdFromParam}`,
      },
      validationSchema: transactionValidationSchema,
      validateOnChange: hasSubmittedForm,
      onSubmit: (values) => onTransferSubmit(values),
    });
  const walletFrom = getWalletById(wallets, +values.walletIdFrom);
  const walletTo = getWalletById(wallets, +values.walletIdTo);

  const isDifferentCurrency = walletTo && walletFrom?.currencyCode !== walletTo?.currencyCode;

  const onDateChange = (date: string) => {
    setFieldValue("date", date);
  };

  // In case amount is negative, remove minus sign for preview
  // TODO - add validation while typing
  const formattedAmount = (amount: string) => amount.replace("-", "");

  const onWalletSelect = (fieldName: string) => (walletId: number) => {
    setFieldValue(fieldName, walletId);
  };

  const onSubmit = () => {
    setHasSubmittedForm(true);
    handleSubmit();
  };

  const onSetAmountFrom = (event: string | React.ChangeEvent<any>) => {
    handleChange("amountFrom")(event);
    if (!isDifferentCurrency) {
      handleChange("amountTo")(event);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
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
          <StyledLabelInput
            value={formattedAmount(values.amountFrom)}
            placeholder={isDifferentCurrency ? "Amount from" : "Amount"}
            onChangeText={onSetAmountFrom}
            keyboardType='decimal-pad'
            style={styles.input}
            icon={<FontAwesome5 name='coins' size={24} color={colors.greenMint} />}
            rightText={walletFrom?.currencySymbol || walletFrom?.currencyCode}
          />
          {isDifferentCurrency && (
            <StyledLabelInput
              value={formattedAmount(values.amountTo)}
              placeholder='Amount to'
              onChangeText={handleChange("amountTo")}
              keyboardType='decimal-pad'
              style={styles.input}
              icon={<FontAwesome5 name='coins' size={24} color={colors.greenMint} />}
              rightText={walletTo?.currencySymbol || walletTo?.currencyCode}
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
    </KeyboardAvoidingView>
  );
};

export default TransferForm;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
    flex: 1,
  },
  inputContainer: {
    gap: 20,
  },
  transferText: {
    fontWeight: "bold",
  },
  submitBtn: {
    marginTop: 20,
  },
  input: {
    backgroundColor: colors.white,
  },
  differentCurrency: {
    paddingTop: 5,
    color: colors.grey2,
    fontSize: 13,
    textAlign: "justify",
  },
});
