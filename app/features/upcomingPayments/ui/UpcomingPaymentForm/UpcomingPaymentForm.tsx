import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import { pressableOpacityStyle } from "modules/pressable";
import React, { useRef, useState } from "react";
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
  UpcomingPaymentFormInputs,
  upcomingPaymentValidationSchema,
} from "../../modules/upcomingPaymentFormValidation";
import { RouteProp } from "@react-navigation/native";
import CustomButton from "components/CustomButton";
import WalletPicker from "app/features/balance/ui/TransactionForm/WalletPicker";
import RepetitionPicker from "./fields/RepetitionPicker";
import EndDatePicker from "./fields/EndDatePicker";
import NotificationSettings from "./fields/NotificationSettings";
import VariableAmountToggle from "./fields/VariableAmountToggle";
import { getCategoryIcon } from "components/CategoryIcon";
import { useGetSelectedWalletQuery, useGetWalletsWithBalance } from "app/queries/wallets";
import { ScrollView } from "react-native-gesture-handler";
import Label from "components/Label";
import TypeSelector from "app/features/balance/ui/TransactionForm/TypeSelector";
import { useGetCategories } from "app/queries/categories";
import ShadowBoxView from "components/ShadowBoxView";
import AmountInput from "app/features/balance/ui/AmountInput";
import { useActionSheet } from "components/ActionSheet/ActionSheetContext";
import { SHEETS } from "components/ActionSheet/ActionSheetManager";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { Type } from "db";

type Props = {
  navigation: StackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, "UpcomingPayment">;
};

const UpcomingPaymentForm: React.FC<Props> = ({ navigation }) => {
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const { data: selectedWallet } = useGetSelectedWalletQuery();
  const { data: wallets } = useGetWalletsWithBalance();
  const { categoriesById } = useGetCategories();
  const isLoading = !wallets.length;
  const dateRef = useRef(new Date());
  const { openSheet } = useActionSheet();
  const styles = useThemedStyles(themeStyles);
  const { primary } = useColors();

  const onUpcomingSubmit = async (values: UpcomingPaymentFormInputs) => {
    Keyboard.dismiss();
    // TODO: wire to addUpcomingPaymentMutation once the service/query layer lands.
    console.log("upcoming payment submit", values);
    navigation.goBack();
  };

  const { values, setFieldValue, errors, handleSubmit, handleChange } =
    useFormik<UpcomingPaymentFormInputs>({
      initialValues: {
        date: formatIsoDate(dateRef.current),
        amount: 0,
        description: "",
        category: null,
        type: null,
        walletId: `${selectedWallet?.walletId}`,
        name: "",
        recurrence: "monthly",
        customIntervalValue: null,
        customIntervalUnit: null,
        endDate: null,
        isVariableAmount: false,
        notifyDaysBefore: 1,
        notifyOnDueDay: true,
        notifyOnMissed: true,
      },
      validationSchema: upcomingPaymentValidationSchema,
      validateOnChange: hasSubmittedForm,
      onSubmit: onUpcomingSubmit,
      enableReinitialize: true,
    });

  const pickedWallet = wallets.find((wallet) => wallet.walletId === +values.walletId);
  const walletCurrency = pickedWallet?.currencySymbol || pickedWallet?.currencyCode;

  const typeOptions = values.category?.id ? categoriesById[values.category.id]?.types ?? [] : [];

  const onSelectCategory = async (categoryId: number) => {
    const category = categoriesById[categoryId];
    await setFieldValue("category", category);
    await setFieldValue("type", null, hasSubmittedForm);
  };

  const showCategoriesSheet = () => {
    Keyboard.dismiss();
    openSheet({
      type: SHEETS.CATEGORY_PICKER,
      props: {
        onSelect: onSelectCategory,
        initialSelected: values.category?.id,
        isTransactionForm: true,
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
        initialValue: values.amount,
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

  const showAmountField = !values.isVariableAmount;

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
        <StyledLabelInput
          placeholder='Name (e.g. Rent, Netflix)'
          maxLength={255}
          value={values.name}
          onChangeText={handleChange("name")}
        />
        <InputErrorLabel text={errors.name} isVisible={!!errors.name} />
        <View style={styles.input}>
          <DatePickerInput
            date={new Date(values.date ?? undefined)}
            onDateSelect={onDateChange}
            hideTime
          />
        </View>
        <View style={styles.walletPicker}>
          <WalletPicker
            wallets={wallets}
            selected={+values.walletId}
            onSelect={onWalletSelect}
          />
          <InputErrorLabel text={errors.walletId} isVisible={!!errors.walletId} />
        </View>
        <View style={styles.input}>
          <VariableAmountToggle
            value={values.isVariableAmount}
            onChange={(v) => setFieldValue("isVariableAmount", v)}
          />
        </View>
        {showAmountField && (
          <AmountInput
            onPress={showAmountSheet}
            style={styles.input}
            amount={values.amount}
            walletCurrency={walletCurrency}
          />
        )}
        {showAmountField && (
          <InputErrorLabel text={errors.amount} isVisible={!!errors.amount} />
        )}
        <ShadowBoxView style={[styles.input, styles.paddingVertical]}>
          <Pressable onPress={showCategoriesSheet} style={pressableOpacityStyle(styles.flexRow)}>
            <View style={styles.icon}>{getCategoryInputIcon}</View>
            <Label
              style={[styles.label, !values.category?.name && styles.placeHolder]}
            >
              {values.category?.name ?? "Select category"}
            </Label>
          </Pressable>
          {values.category?.id && (
            <TypeSelector
              categoryId={values.category?.id}
              types={typeOptions}
              onSelect={onSelectType}
              selected={values.type?.id}
              showAddNewButton
            />
          )}
        </ShadowBoxView>
        <InputErrorLabel text={errors.category} isVisible={!!errors.category} />
        <InputErrorLabel text={errors.type} isVisible={!!errors.type} />
        <StyledLabelInput
          placeholder='Note (optional)'
          style={styles.input}
          maxLength={300}
          value={values.description}
          onChangeText={handleChange("description")}
        />
        <View style={styles.input}>
          <RepetitionPicker
            recurrence={values.recurrence}
            onRecurrenceChange={(value) => setFieldValue("recurrence", value)}
            customIntervalValue={values.customIntervalValue}
            onCustomIntervalValueChange={(value) => setFieldValue("customIntervalValue", value)}
            customIntervalUnit={values.customIntervalUnit}
            onCustomIntervalUnitChange={(value) => setFieldValue("customIntervalUnit", value)}
          />
          <InputErrorLabel
            text={errors.customIntervalValue as string | undefined}
            isVisible={!!errors.customIntervalValue}
          />
          <InputErrorLabel
            text={errors.customIntervalUnit as string | undefined}
            isVisible={!!errors.customIntervalUnit}
          />
        </View>
        {values.recurrence !== "none" && (
          <View style={styles.input}>
            <EndDatePicker
              endDate={values.endDate}
              onChange={(value) => setFieldValue("endDate", value)}
              minimumDate={new Date(values.date)}
            />
            <InputErrorLabel text={errors.endDate} isVisible={!!errors.endDate} />
          </View>
        )}
        <View style={styles.input}>
          <NotificationSettings
            notifyDaysBefore={values.notifyDaysBefore}
            onNotifyDaysBeforeChange={(value) => setFieldValue("notifyDaysBefore", value)}
            notifyOnDueDay={values.notifyOnDueDay}
            onNotifyOnDueDayChange={(value) => setFieldValue("notifyOnDueDay", value)}
            notifyOnMissed={values.notifyOnMissed}
            onNotifyOnMissedChange={(value) => setFieldValue("notifyOnMissed", value)}
          />
        </View>
        <CustomButton title='Save' onPress={onSubmit} style={styles.button} />
      </View>
      <AppActivityIndicator hideScreen isLoading={isLoading} />
    </ScrollView>
  );
};

export default UpcomingPaymentForm;

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
      paddingHorizontal: 8,
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
      marginRight: 8,
    },
    label: { fontSize: 20, flex: 1, fontWeight: "500" },
    placeHolder: { color: theme.colors.placeholder },
  });
