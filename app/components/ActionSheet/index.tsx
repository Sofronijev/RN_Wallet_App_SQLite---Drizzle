import React, { FC, PropsWithChildren } from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import TransactionBottomSheet from "./CategoriesSheet";
import CurrencySheet from "./CurrencySheet";
import ColorSheet from "./ColorSheet";
import PickerSheet from "./PickerSheet";

const ActionSheetProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <BottomSheetModalProvider>
      {children}
      <TransactionBottomSheet />
      <CurrencySheet />
      <ColorSheet />
      <PickerSheet />
    </BottomSheetModalProvider>
  );
};

export default ActionSheetProvider;
