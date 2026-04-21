import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import Label from "components/Label";
import CategoryIcon from "components/CategoryIcon";
import ButtonText from "components/ButtonText";
import { formatDecimalDigits } from "modules/numbers";
import { pressableOpacityStyle } from "modules/pressable";
import { dueDateFormat, getFormattedDate } from "modules/timeAndDate";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import { DummyUpcomingInstanceRow } from "../modules/upcomingPaymentsDummyData";

type Props = {
  row: DummyUpcomingInstanceRow;
};

const UpcomingPaymentRow: React.FC<Props> = ({ row }) => {
  const styles = useThemedStyles(themedStyles);
  const { decimal, delimiter } = useGetNumberSeparatorQuery();

  const { instanceId, upcomingPaymentId, name, dueDate, expectedAmount, status, category } = row;
  const isVariable = expectedAmount == null;
  const isMissed = status === "missed";

  const openDetail = () => {
    console.log("TODO: open detail for upcomingPaymentId", upcomingPaymentId);
  };

  const openPaySheet = () => {
    console.log("TODO: open PaySheet for instance", instanceId);
  };

  return (
    <Pressable style={pressableOpacityStyle(styles.container)} onPress={openDetail}>
      <View style={styles.icon}>
        <CategoryIcon
          color={category.color}
          iconFamily={category.iconFamily}
          name={category.name}
        />
      </View>
      <View style={styles.descriptionContainer}>
        <Label numberOfLines={1} style={styles.name}>
          {name}
        </Label>
        <View style={styles.metaRow}>
          <Label style={styles.dueDate} numberOfLines={1}>
            {`Due ${getFormattedDate(dueDate, dueDateFormat)}`}
          </Label>
          {isMissed && (
            <View style={styles.missedBadge}>
              <Label style={styles.missedBadgeText}>Missed</Label>
            </View>
          )}
        </View>
      </View>
      <View style={styles.rightColumn}>
        <Label style={[styles.amount, isVariable && styles.amountVariable]}>
          {isVariable ? "Variable" : formatDecimalDigits(expectedAmount!, delimiter, decimal)}
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
