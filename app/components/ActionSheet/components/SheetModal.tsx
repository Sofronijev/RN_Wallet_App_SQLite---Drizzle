import React, { FC, PropsWithChildren, useCallback, useEffect, useLayoutEffect } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetProps,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { BackHandler, Platform, StyleSheet, useWindowDimensions } from "react-native";
import { useActionSheet } from "../ActionSheetContext";
import { AppTheme, useColors, useThemedStyles } from "app/theme/useThemedStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  sheetRef: React.RefObject<BottomSheetModalMethods | null>;
  snapPoints?: BottomSheetProps["snapPoints"];
  onDismiss?: () => void;
  maxDynamicContentSize?: number;
};

const SheetModal: FC<PropsWithChildren<Props>> = ({
  children,
  sheetRef,
  snapPoints,
  onDismiss,
  maxDynamicContentSize,
}) => {
  const { closeSheet, activeSheet } = useActionSheet();
  const { height } = useWindowDimensions();
  const styles = useThemedStyles(themeStyles);
  const colors = useColors();
  const maxSize = height - 150;
  const { bottom } = useSafeAreaInsets();

  useLayoutEffect(() => {
    requestAnimationFrame(() => sheetRef?.current?.present());
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const handleBack = () => {
      closeSheet(activeSheet?.type);
      return true;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBack);
    return () => subscription.remove();
  }, []);

  const onDismissAction = () => {
    closeSheet(activeSheet?.type);
    onDismiss?.();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );
  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onDismissAction}
      backdropComponent={renderBackdrop}
      handleStyle={styles.handle}
      // Mora da ima BottomSheetView ili neki drugi kao container da bi radio
      enableDynamicSizing={!snapPoints}
      detached
      bottomInset={bottom ?? 40}
      style={styles.modal}
      maxDynamicContentSize={maxDynamicContentSize ?? maxSize}
      backgroundStyle={{
        backgroundColor: colors.card,
      }}
    >
      {children}
    </BottomSheetModal>
  );
};

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    handle: {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: theme.colors.card,
    },
    modal: {
      marginHorizontal: 8,
    },
  });

export default SheetModal;
