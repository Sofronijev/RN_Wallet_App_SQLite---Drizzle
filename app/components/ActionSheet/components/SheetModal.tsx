import React, { FC, PropsWithChildren, useCallback, useEffect, useLayoutEffect } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetProps,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { BackHandler, Platform, StyleSheet } from "react-native";
import { useActionSheet } from "../ActionSheetContext";

type Props = {
  sheetRef: React.RefObject<BottomSheetModalMethods>;
  snapPoints: BottomSheetProps["snapPoints"];
  onDismiss?: () => void;
};

export const HANDLE_HEIGHT = 24;

const SheetModal: FC<PropsWithChildren<Props>> = ({
  children,
  sheetRef,
  snapPoints,
  onDismiss,
}) => {
  const { closeSheet, activeSheet } = useActionSheet();
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
      enableDynamicSizing={false}
    >
      {children}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  handle: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

export default SheetModal;
