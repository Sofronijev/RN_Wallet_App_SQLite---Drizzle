import { Alert, Keyboard, Pressable, StyleSheet, View } from "react-native";
import { pressableOpacityStyle } from "modules/pressable";
import React, { useMemo, useRef, useState } from "react";
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
import RepetitionPicker from "./fields/RepetitionPicker";
import EndDatePicker from "./fields/EndDatePicker";
import NotificationSettings from "./fields/NotificationSettings";
import VariableAmountToggle from "./fields/VariableAmountToggle";
import LockedInfoBox from "./LockedInfoBox";
import { getCategoryIcon } from "components/CategoryIcon";
import { useGetSelectedWalletQuery, useGetWalletsWithBalance } from "app/queries/wallets";
import {
  addUpcomingPaymentMutation,
  useGetUpcomingPaymentById,
  useUpdateUpcomingPaymentMutation,
} from "app/queries/upcomingPayments";
import { deriveEditInitialValues } from "../../modules/deriveEditInitialValues";
import { CurrencyType } from "app/currencies/currencies";
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

const UpcomingPaymentForm: React.FC<Props> = ({ navigation, route }) => {
  const editId = route.params?.id;
  const isEditMode = !!editId;
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const { data: selectedWallet } = useGetSelectedWalletQuery();
  const { data: wallets } = useGetWalletsWithBalance();
  const { categoriesById } = useGetCategories();
  const { addUpcomingPayment, isLoading: isSaving } = addUpcomingPaymentMutation();
  const { updateUpcomingPayment, isLoading: isUpdating } = useUpdateUpcomingPaymentMutation();
  const { data: editPayment, isLoading: isLoadingEdit } = useGetUpcomingPaymentById(editId);
  const historyCount = editPayment?.historyCount ?? 0;
  const isLocked = isEditMode && historyCount > 0;
  const isLoading =
    !selectedWallet || isSaving || isUpdating || (isEditMode && (isLoadingEdit || !editPayment));

  const walletCurrencies = useMemo(() => {
    const map = new Map<string, { currencyCode: string; currencySymbol: string }>();
    for (const w of wallets) {
      if (!w.currencyCode) continue;
      if (!map.has(w.currencyCode)) {
        map.set(w.currencyCode, {
          currencyCode: w.currencyCode,
          currencySymbol: w.currencySymbol ?? "",
        });
      }
    }
    return Array.from(map.values());
  }, [wallets]);
  const hasMultipleCurrencies = walletCurrencies.length > 1;
  const dateRef = useRef(new Date());
  const { openSheet } = useActionSheet();
  const styles = useThemedStyles(themeStyles);
  const { primary } = useColors();

  const onUpcomingSubmit = async (values: UpcomingPaymentFormInputs) => {
    Keyboard.dismiss();
    if (!values.category?.id) return;

    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      amount: values.isVariableAmount ? null : values.amount,
      categoryId: values.category.id,
      typeId: values.type?.id ?? null,
      currencyCode: values.currencyCode,
      currencySymbol: values.currencySymbol,
      firstDueDate: values.date,
      endDate: values.endDate,
      recurrence: values.recurrence,
      customIntervalValue:
        values.recurrence === "custom" ? values.customIntervalValue : null,
      customIntervalUnit:
        values.recurrence === "custom" ? values.customIntervalUnit : null,
      notifyDaysBefore: values.notifyDaysBefore,
      notifyOnDueDay: values.notifyOnDueDay,
      notifyOnMissed: values.notifyOnMissed,
    };

    const onError = (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Upcoming payment save failed:", err);
      Alert.alert("Could not save", message);
    };

    if (isEditMode) {
      updateUpcomingPayment(
        { id: editId as number, values: payload },
        { onSuccess: () => navigation.goBack(), onError }
      );
    } else {
      addUpcomingPayment(payload, {
        onSuccess: () => navigation.goBack(),
        onError,
      });
    }
  };

  const initialValues = useMemo<UpcomingPaymentFormInputs>(() => {
    if (isEditMode && editPayment) {
      return deriveEditInitialValues(editPayment, categoriesById);
    }
    return {
      date: formatIsoDate(dateRef.current),
      amount: 0,
      description: "",
      category: null,
      type: null,
      currencyCode: selectedWallet?.currencyCode ?? "",
      currencySymbol: selectedWallet?.currencySymbol ?? "",
      name: "",
      recurrence: "monthly",
      customIntervalValue: null,
      customIntervalUnit: null,
      endDate: null,
      isVariableAmount: false,
      notifyDaysBefore: 1,
      notifyOnDueDay: true,
      notifyOnMissed: true,
    };
  }, [isEditMode, editPayment, categoriesById, selectedWallet]);

  const { values, setFieldValue, errors, handleSubmit, handleChange } =
    useFormik<UpcomingPaymentFormInputs>({
      initialValues,
      validationSchema: upcomingPaymentValidationSchema,
      validateOnChange: hasSubmittedForm,
      onSubmit: onUpcomingSubmit,
      enableReinitialize: true,
    });

  const walletCurrency = values.currencySymbol || values.currencyCode;

  const typeOptions = values.category?.id ? (categoriesById[values.category.id]?.types ?? []) : [];

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
        forForm: true,
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

  const onCurrencySelect = (currency: CurrencyType | null) => {
    setFieldValue("currencyCode", currency?.currencyCode ?? "");
    setFieldValue("currencySymbol", currency?.symbol ?? "");
  };

  const showCurrencySheet = () => {
    Keyboard.dismiss();
    openSheet({
      type: SHEETS.CURRENCY_PICKER,
      props: {
        onSelect: onCurrencySelect,
        selectedCurrencyCode: values.currencyCode || null,
        allowedCurrencyCodes: walletCurrencies.map((c) => c.currencyCode),
      },
    });
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
        <View style={styles.input}>
          <StyledLabelInput
            placeholder='Name (e.g. Rent, Netflix)'
            maxLength={255}
            value={values.name}
            onChangeText={handleChange("name")}
          />
          <InputErrorLabel text={errors.name} isVisible={!!errors.name} />
        </View>
        {(hasMultipleCurrencies || showAmountField) && (
          <View style={[styles.input, styles.amountRow]}>
            {showAmountField && (
              <AmountInput
                onPress={showAmountSheet}
                style={styles.amountInput}
                amount={values.amount}
                walletCurrency={walletCurrency}
              />
            )}
            {hasMultipleCurrencies && (
              <View
                style={[styles.currencyBox, isLocked && styles.lockedWrapper]}
                pointerEvents={isLocked ? "none" : "auto"}
              >
                <ShadowBoxView style={[styles.currencyBox, styles.paddingVertical]}>
                  <Pressable
                    onPress={showCurrencySheet}
                    style={pressableOpacityStyle(styles.currencyPressable)}
                  >
                    <Label
                      numberOfLines={1}
                      style={[styles.currencyLabel, !values.currencyCode && styles.placeHolder]}
                    >
                      {values.currencyCode
                        ? showAmountField
                          ? values.currencySymbol || values.currencyCode
                          : `${values.currencySymbol || ""} ${values.currencyCode}`.trim()
                        : "Currency"}
                    </Label>
                  </Pressable>
                </ShadowBoxView>
              </View>
            )}
          </View>
        )}
        {isLocked && hasMultipleCurrencies && (
          <LockedInfoBox text='Currency is locked because this payment has recorded history. Changing it would mix currencies across paid transactions.' />
        )}
        {hasMultipleCurrencies && (
          <InputErrorLabel text={errors.currencyCode} isVisible={!!errors.currencyCode} />
        )}
        {showAmountField && <InputErrorLabel text={errors.amount} isVisible={!!errors.amount} />}
        <View style={styles.input}>
          <VariableAmountToggle
            value={values.isVariableAmount}
            onChange={(v) => setFieldValue("isVariableAmount", v)}
          />
        </View>
        <ShadowBoxView style={[styles.input, styles.paddingVertical]}>
          <Pressable onPress={showCategoriesSheet} style={pressableOpacityStyle(styles.flexRow)}>
            <View style={styles.icon}>{getCategoryInputIcon}</View>
            <Label style={[styles.label, !values.category?.name && styles.placeHolder]}>
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
        <View style={styles.input}>
          <Label style={styles.heading}>Start date</Label>
          <View style={isLocked && styles.lockedWrapper} pointerEvents={isLocked ? "none" : "auto"}>
            <DatePickerInput
              date={new Date(values.date ?? undefined)}
              onDateSelect={onDateChange}
              hideTime
            />
          </View>
          {isLocked && (
            <LockedInfoBox text='Start date is locked because this payment has recorded history. It anchors the recurrence — changing it would invalidate past due dates.' />
          )}
        </View>
        {isEditMode && !isLocked && values.recurrence !== "none" && (
          <View style={styles.input}>
            <LockedInfoBox
              text='Changes to repetition or interval apply to future instances only. Past paid instances are unchanged.'
              tone='info'
            />
          </View>
        )}
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
      marginBottom: 20,
    },
    inputsContainer: {
      marginHorizontal: 16,
      marginBottom: 40,
    },
    heading: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.colors.muted,
      paddingBottom: 8,
    },
    flexRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
    },
    input: {
      marginTop: 12,
    },
    variableAmount: {
      marginTop: 4,
    },
    button: {
      marginTop: 20,
    },
    paddingVertical: {
      paddingVertical: 10,
    },
    amountRow: {
      flexDirection: "row",
      alignItems: "stretch",
      gap: 8,
    },
    currencyBox: {
      flex: 1,
      justifyContent: "center",
    },
    currencyPressable: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
    },
    currencyLabel: {
      fontSize: 16,
      fontWeight: "500",
    },
    amountInput: {
      flex: 3,
    },
    icon: {
      width: 45,
      marginRight: 8,
    },
    label: { fontSize: 20, flex: 1, fontWeight: "500" },
    placeHolder: { color: theme.colors.placeholder },
    lockedWrapper: { opacity: 0.55 },
  });
