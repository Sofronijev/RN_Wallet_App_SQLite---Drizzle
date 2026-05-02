import { Keyboard, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Type } from "db";
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
import LinkedPaymentSection from "./LinkedPaymentSection";
import {
  LinkableInstanceRow,
  useGetUpcomingPaymentInstanceContext,
} from "app/queries/upcomingPayments";
import { displayCurrency, sameCurrency } from "modules/currency";
import {
  formatEditInitialValues,
  formatPayInitialValues,
  getDefaultInitialValues,
} from "../../modules/transactionInitialValues";

type Props = {
  navigation: StackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, "Transaction">;
};

const TransactionForm: React.FC<Props> = ({ navigation, route }) => {
  const editTransactionId = route.params?.id;
  const upcomingPaymentInstanceId = route.params?.upcomingPaymentInstanceId;
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const { data: selectedWallet } = useGetSelectedWalletQuery();
  const { data: editedTransaction } = useGetTransactionByIdQuery(editTransactionId);
  const { data: payContext } = useGetUpcomingPaymentInstanceContext(upcomingPaymentInstanceId);
  const { data: wallets } = useGetWalletsWithBalance();
  const { categoriesById } = useGetCategories();
  const { addTransaction } = addTransactionMutation();
  const { editTransaction } = editTransactionMutation();
  const { deleteTransaction } = deleteTransactionMutation();
  const isLoading =
    (!!editTransactionId && !editedTransaction) ||
    (!!upcomingPaymentInstanceId && !payContext) ||
    !wallets.length;
  const dateRef = useRef(new Date());
  const { openSheet } = useActionSheet();
  const styles = useThemedStyles(themeStyles);
  const { primary } = useColors();

  const onTransactionSubmit = async (values: TransactionFromInputs) => {
    Keyboard.dismiss();
    if (values.category && values.walletId) {
      const transactionData = {
        amount: formatFormAmountValue(
          values.amount,
          values.category.transactionType,
          values.type?.transactionType
        ),
        description: values.description,
        date: formatIsoDate(values.date),
        type_id: values.type?.id ?? null,
        categoryId: values.category.id,
        wallet_id: Number(values.walletId),
      };
      if (editTransactionId) {
        editTransaction({
          id: editTransactionId,
          transaction: transactionData,
          linkedUpcomingInstanceId: values.linkedUpcomingInstanceId,
        });
      } else {
        addTransaction({
          transaction: transactionData,
          linkedUpcomingInstanceId: values.linkedUpcomingInstanceId,
        });
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

  const initialValues = useMemo<TransactionFromInputs>(() => {
    if (editedTransaction) return formatEditInitialValues(editedTransaction);
    if (payContext)
      return formatPayInitialValues(payContext, {
        wallets,
        categoriesById,
        selectedWalletId: selectedWallet?.walletId,
        today: dateRef.current,
      });
    return getDefaultInitialValues(wallets, selectedWallet?.walletId, dateRef.current);
  }, [editedTransaction, payContext, wallets, categoriesById, selectedWallet?.walletId]);

  const { values, setFieldValue, errors, handleSubmit, handleChange } =
    useFormik<TransactionFromInputs>({
      initialValues,
      validationSchema: transactionValidationSchema,
      validateOnChange: hasSubmittedForm,
      onSubmit: onTransactionSubmit,
      enableReinitialize: true,
    });

  const pickedWallet = wallets.find((wallet) => wallet.walletId === +values.walletId);
  const walletCurrency = displayCurrency(pickedWallet);

  const isEditingSystemTransaction = !!editTransactionId && values.category?.type === "system";
  const isCategoryLocked = values.linkedUpcomingInstanceId != null;
  const isCategoryDisabled = isEditingSystemTransaction || isCategoryLocked;

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

  const hasOpenedAmountSheet = useRef(false);
  useEffect(() => {
    if (hasOpenedAmountSheet.current) return;
    if (editTransactionId) return;
    if (upcomingPaymentInstanceId && !payContext) return;
    hasOpenedAmountSheet.current = true;
    if (values.amount > 0) return;
    showAmountSheet();
  }, [editTransactionId, upcomingPaymentInstanceId, payContext, values.amount]);

  const typeOptions = values.category?.id ? categoriesById[values.category.id]?.types ?? [] : [];

  // Zbog problema sa validacijom dodao sam async/await, da bi se sacekala promena
  const onSelectCategory = async (categoryId: number) => {
    const category = categoriesById[categoryId];
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

  const onWalletSelect = (walletId: number) => {
    setFieldValue("walletId", walletId);
  };

  const onSelectLinkedInstance = (instance: LinkableInstanceRow | null) => {
    setFieldValue("linkedUpcomingInstanceId", instance?.instanceId ?? null);
    if (
      instance &&
      instance.expectedAmount != null &&
      sameCurrency(pickedWallet?.currencyCode, instance.currencyCode)
    ) {
      setFieldValue("amount", instance.expectedAmount, hasSubmittedForm);
    }
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
          <WalletPicker
            wallets={wallets}
            selected={+values.walletId}
            onSelect={onWalletSelect}
            disabled={isEditingSystemTransaction}
          />
          <InputErrorLabel text={errors.walletId} isVisible={!!errors.walletId} />
        </View>
        <AmountInput
          onPress={showAmountSheet}
          style={styles.input}
          amount={values.amount}
          walletCurrency={walletCurrency}
          disabled={isEditingSystemTransaction}
        />
        <InputErrorLabel text={errors.amount} isVisible={!!errors.amount} />
        <ShadowBoxView
          style={[
            styles.input,
            styles.paddingVertical,
            isCategoryDisabled && styles.disable,
          ]}
        >
          <TouchableOpacity
            onPress={showCategoriesSheet}
            style={styles.flexRow}
            disabled={isCategoryDisabled}
          >
            <View style={styles.icon}>{getCategoryInputIcon}</View>
            <Label
              style={[
                styles.label,
                !values.category?.name && styles.placeHolder,
                isCategoryDisabled && styles.disabledText,
              ]}
            >
              {values.category?.name ?? "Select category"}
            </Label>
          </TouchableOpacity>
          {values.category?.id && !isCategoryDisabled && (
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
          placeholder='Transaction comment'
          style={styles.input}
          maxLength={300}
          value={values.description}
          onChangeText={handleChange("description")}
        />
        {isEditingSystemTransaction && (
          <Label style={styles.systemText}>
            Balance correction is a built-in category with limited editing.
          </Label>
        )}
        {!isEditingSystemTransaction && (
          <View style={styles.input}>
            <LinkedPaymentSection
              categoryId={values.category?.id ?? null}
              walletCurrencyCode={pickedWallet?.currencyCode ?? null}
              linkedInstanceId={values.linkedUpcomingInstanceId}
              onSelect={onSelectLinkedInstance}
              initiallyExpanded={
                !!upcomingPaymentInstanceId || values.linkedUpcomingInstanceId != null
              }
            />
          </View>
        )}
        <CustomButton title='Save' onPress={onSubmit} style={styles.button} />
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
      marginRight: 8,
    },
    label: { fontSize: 20, flex: 1, fontWeight: "500" },
    placeHolder: { color: theme.colors.placeholder },
    disable: {
      backgroundColor: theme.colors.disabled,
    },
    disabledText: {
      color: theme.colors.muted,
    },
    systemText: {
      color: theme.colors.muted,
      paddingTop: 8,
    },
  });
