import React, { FC, PropsWithChildren, useCallback } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetProps,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import colors from "constants/colors";
import { StyleSheet } from "react-native";

type Props = {
  sheetRef: React.RefObject<BottomSheetModalMethods>;
  snapPoints: BottomSheetProps["snapPoints"];
  onDismiss?: () => void;
};

export const HANDLE_HEIGHT = 24;

const SheetModal: FC<PropsWithChildren<Props>> = ({ children, sheetRef, snapPoints, onDismiss }) => {
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
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      handleStyle={styles.handle}
      handleHeight={HANDLE_HEIGHT}
    >
      {children}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  handle: {
    backgroundColor: colors.grey3,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

export default SheetModal;
