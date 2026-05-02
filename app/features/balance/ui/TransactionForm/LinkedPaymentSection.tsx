import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Label from "components/Label";
import ButtonText from "components/ButtonText";
import ShadowBoxView from "components/ShadowBoxView";
import { getCategoryIcon } from "components/CategoryIcon";
import { dueDateFormat, getFormattedDate } from "modules/timeAndDate";
import { displayCurrency, sameCurrency } from "modules/currency";
import { formatExpectedAmount } from "app/features/upcomingPayments/modules/formatPaymentAmount";
import { useGetNumberSeparatorQuery } from "app/queries/user";
import {
  LinkableInstanceRow,
  useGetLinkablePendingInstances,
} from "app/queries/upcomingPayments";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";

type Styles = ReturnType<typeof themeStyles>;

const InstanceIdentity: React.FC<{ row: LinkableInstanceRow; styles: Styles }> = ({
  row,
  styles,
}) => (
  <>
    <View style={styles.rowIcon}>
      {getCategoryIcon({
        iconFamily: row.iconFamily,
        name: row.iconName,
        color: row.iconColor,
        iconSize: 22,
      })}
    </View>
    <View style={styles.rowText}>
      <Label style={styles.rowTitle}>{row.paymentName}</Label>
      <Label style={styles.rowSub}>{`Due ${getFormattedDate(row.dueDate, dueDateFormat)}`}</Label>
    </View>
  </>
);

type Props = {
  categoryId: number | null;
  walletCurrencyCode: string | null;
  linkedInstanceId: number | null;
  onSelect: (instance: LinkableInstanceRow | null) => void;
  initiallyExpanded?: boolean;
};

const LinkedPaymentSection: React.FC<Props> = ({
  categoryId,
  walletCurrencyCode,
  linkedInstanceId,
  onSelect,
  initiallyExpanded,
}) => {
  const styles = useThemedStyles(themeStyles);
  const themeColors = useColors();
  const { decimal, delimiter } = useGetNumberSeparatorQuery();
  const { data: instances } = useGetLinkablePendingInstances(categoryId, linkedInstanceId);

  const [expanded, setExpanded] = useState(!!initiallyExpanded);

  useEffect(() => {
    if (linkedInstanceId != null) setExpanded(true);
  }, [linkedInstanceId]);

  const linked: LinkableInstanceRow | undefined = useMemo(
    () => instances.find((i) => i.instanceId === linkedInstanceId),
    [instances, linkedInstanceId],
  );

  const grouped = useMemo(() => {
    const map = new Map<number, { name: string; rows: LinkableInstanceRow[] }>();
    for (const row of instances) {
      if (row.instanceId === linkedInstanceId) continue;
      const existing = map.get(row.upcomingPaymentId);
      if (existing) {
        existing.rows.push(row);
      } else {
        map.set(row.upcomingPaymentId, { name: row.paymentName, rows: [row] });
      }
    }
    return Array.from(map.entries());
  }, [instances, linkedInstanceId]);

  const renderInstanceRow = (row: LinkableInstanceRow) => {
    const isSelected = row.instanceId === linkedInstanceId;
    const currency = displayCurrency(row);
    return (
      <Pressable
        key={row.instanceId}
        onPress={() => onSelect(row)}
        style={[styles.row, isSelected && styles.rowSelected]}
      >
        <InstanceIdentity row={row} styles={styles} />
        <Label style={styles.rowAmount}>
          {formatExpectedAmount(row.expectedAmount, { delimiter, decimal, currency })}
        </Label>
        {isSelected && <MaterialIcons name='check' size={18} color={themeColors.primary} />}
      </Pressable>
    );
  };

  const summary = linked ? (
    <View style={styles.linkedRow}>
      <InstanceIdentity row={linked} styles={styles} />
      <ButtonText
        title='Unlink'
        type='danger'
        onPress={() => onSelect(null)}
        buttonStyle={styles.unlinkText}
      />
    </View>
  ) : (
    <View style={styles.collapsedRow}>
      <MaterialIcons name='link' size={20} color={themeColors.primary} />
      <Label style={styles.collapsedText}>
        {`Link upcoming payment · ${instances.length} available`}
      </Label>
      <MaterialIcons
        name={expanded ? "expand-less" : "expand-more"}
        size={22}
        color={themeColors.muted}
      />
    </View>
  );

  return (
    <ShadowBoxView style={styles.container}>
      <TouchableOpacity onPress={() => setExpanded((v) => !v)} activeOpacity={0.7}>
        {summary}
      </TouchableOpacity>
      {linkedInstanceId != null && (
        <Label style={styles.helperText}>
          Category locked while linked. Unlink to change category.
        </Label>
      )}
      {linked && !sameCurrency(walletCurrencyCode, linked.currencyCode) && (
        <View style={styles.warningRow}>
          <MaterialIcons name='warning-amber' size={16} color={themeColors.redDark} />
          <Label style={styles.warningText}>
            {`Wallet is ${walletCurrencyCode ?? "?"}, payment is ${linked.currencyCode ?? "?"}. Enter the amount in your wallet currency — linking will mark the payment as paid.`}
          </Label>
        </View>
      )}
      {expanded && (
        <View style={styles.list}>
          {grouped.map(([paymentId, group]) => (
            <View key={paymentId}>
              {group.rows.length > 1 && (
                <Label style={styles.groupHeader}>{group.name}</Label>
              )}
              {group.rows.map(renderInstanceRow)}
            </View>
          ))}
        </View>
      )}
    </ShadowBoxView>
  );
};

export default LinkedPaymentSection;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      padding: 12,
      gap: 6,
    },
    collapsedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    collapsedText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "500",
    },
    linkedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    helperText: {
      fontSize: 12,
      color: theme.colors.muted,
      fontStyle: "italic",
    },
    list: {
      gap: 4,
      marginTop: 4,
    },
    groupHeader: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: 6,
      marginBottom: 2,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 6,
      borderRadius: 8,
    },
    rowSelected: {
      backgroundColor: theme.colors.selected,
    },
    rowIcon: {
      width: 28,
      alignItems: "center",
    },
    rowText: {
      flex: 1,
    },
    rowTitle: {
      fontSize: 14,
      fontWeight: "500",
    },
    rowSub: {
      fontSize: 12,
      color: theme.colors.muted,
      marginTop: 2,
    },
    rowAmount: {
      fontSize: 13,
      fontWeight: "600",
    },
    unlinkText: {
      fontSize: 13,
      fontWeight: "600",
    },
    warningRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      paddingTop: 4,
    },
    warningText: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.redDark,
      lineHeight: 16,
    },
  });
