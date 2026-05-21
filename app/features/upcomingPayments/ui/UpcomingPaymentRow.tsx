import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Label from "components/Label";
import CategoryIcon from "components/CategoryIcon";
import ButtonText from "components/ButtonText";
import { pressableOpacityStyle } from "modules/pressable";
import { dueDateFormat, getFormattedDate } from "modules/timeAndDate";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import { useAppNavigation } from "navigation/routes";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { UpcomingInstanceSectionRow } from "app/queries/upcomingPayments";
import { isInstanceMissed } from "../modules/upcomingPaymentStatus";
import { formatExpectedAmount } from "../modules/formatPaymentAmount";
import { sectionRowHasMissingReminders } from "../modules/upcomingPaymentNotificationStatus";

type Props = {
  row: UpcomingInstanceSectionRow;
};

const UpcomingPaymentRow: React.FC<Props> = ({ row }) => {
  const styles = useThemedStyles(themedStyles);
  const themeColors = useColors();
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
  const hasMissingReminders = sectionRowHasMissingReminders(row);

  const openDetail = () => {
    navigation.navigate("UpcomingPaymentDetails", { id: upcomingPaymentId });
  };

  const openPaySheet = () => {
    navigation.navigate("Transaction", { upcomingPaymentInstanceId: id });
  };

  return (
    <Pressable style={pressableOpacityStyle(styles.container)} onPress={openDetail}>
      <View style={styles.icon}>
        <CategoryIcon color={iconColor} iconFamily={iconFamily} name={iconName} />
      </View>
      <View style={styles.descriptionContainer}>
        <View style={styles.nameRow}>
          <Label numberOfLines={1} style={styles.name}>
            {name}
          </Label>
          {hasMissingReminders && (
            <MaterialCommunityIcons
              name='bell-off-outline'
              size={14}
              color={themeColors.redDark}
              style={styles.reminderWarningIcon}
            />
          )}
        </View>
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
          {formatExpectedAmount(expectedAmount, { delimiter, decimal })}
        </Label>
        <ButtonText
          title='Pay'
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
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    name: {
      fontSize: 15,
      fontWeight: "bold",
      flexShrink: 1,
    },
    reminderWarningIcon: {
      marginLeft: 6,
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
