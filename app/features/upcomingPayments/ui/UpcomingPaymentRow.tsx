import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import Label from "components/Label";
import CategoryIcon from "components/CategoryIcon";
import ButtonText from "components/ButtonText";
import { pressableOpacityStyle } from "modules/pressable";
import { dueDateFormat, getFormattedDate } from "modules/timeAndDate";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { useAppNavigation } from "navigation/routes";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { UpcomingInstanceSectionRow } from "app/queries/upcomingPayments";
import { isInstanceMissed } from "../modules/upcomingPaymentStatus";
import { formatPaymentAmount } from "../modules/formatPaymentAmount";

type Props = {
  row: UpcomingInstanceSectionRow;
};

const UpcomingPaymentRow: React.FC<Props> = ({ row }) => {
  const styles = useThemedStyles(themedStyles);
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const navigation = useAppNavigation();

  const {
    id,
    upcomingPaymentId,
    name,
    dueDate,
    expectedAmount,
    iconFamily,
    iconName,
    iconColor,
    staleSince,
  } = row;
  const isVariable = expectedAmount == null;
  const isStale = staleSince != null;
  const isMissed = !isStale && isInstanceMissed(row);

  const openDetail = () => {
    navigation.navigate("UpcomingPaymentDetails", { id: upcomingPaymentId });
  };

  const openPaySheet = () => {
    console.log("TODO: open PaySheet for instance", id);
  };

  return (
    <Pressable style={pressableOpacityStyle(styles.container)} onPress={openDetail}>
      <View style={styles.icon}>
        <CategoryIcon color={iconColor} iconFamily={iconFamily} name={iconName} />
      </View>
      <View style={styles.descriptionContainer}>
        <Label numberOfLines={1} style={styles.name}>
          {name}
        </Label>
        <View style={styles.metaRow}>
          <Label style={styles.dueDate} numberOfLines={1}>
            {`Due ${getFormattedDate(dueDate, dueDateFormat)}`}
          </Label>
          {isStale && (
            <View style={styles.missedBadge}>
              <Label style={styles.missedBadgeText}>Needs review</Label>
            </View>
          )}
          {isMissed && (
            <View style={styles.missedBadge}>
              <Label style={styles.missedBadgeText}>Missed</Label>
            </View>
          )}
        </View>
      </View>
      <View style={styles.rightColumn}>
        <Label style={[styles.amount, isVariable && styles.amountVariable]}>
          {formatPaymentAmount(expectedAmount, { delimiter, decimal, nullLabel: "Variable" })}
        </Label>
        <ButtonText
          title={isVariable ? "Enter & Pay" : "Pay"}
          onPress={openPaySheet}
          buttonStyle={styles.payButtonText}
        />
      </View>
    </Pressable>
  );
};

export default UpcomingPaymentRow;

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
    },
    icon: {
      paddingHorizontal: 10,
    },
    descriptionContainer: {
      flex: 1,
    },
    name: {
      fontSize: 15,
      fontWeight: "bold",
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
      flexWrap: "wrap",
    },
    dueDate: {
      fontSize: 13,
      color: theme.colors.muted,
    },
    missedBadge: {
      marginLeft: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.redDark,
    },
    missedBadgeText: {
      color: theme.colors.redDark,
      fontSize: 11,
      fontWeight: "600",
    },
    rightColumn: {
      alignItems: "flex-end",
      paddingHorizontal: 10,
    },
    amount: {
      fontSize: 16,
      fontWeight: "bold",
    },
    amountVariable: {
      color: theme.colors.muted,
      fontStyle: "italic",
    },
    payButtonText: {
      fontSize: 13,
      fontWeight: "600",
      marginTop: 4,
    },
  });
