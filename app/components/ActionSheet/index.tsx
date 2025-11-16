import React, { FC, PropsWithChildren } from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import TransactionBottomSheet from "./CategoriesSheet";
import CurrencySheet from "./CurrencySheet";
import ColorSheet from "./ColorSheet";
import PickerSheet from "./PickerSheet";
import NumericKeyboard from "./NumbericKeyboard";

const ActionSheetProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <BottomSheetModalProvider>
      {children}
      <TransactionBottomSheet />
      <CurrencySheet />
      <ColorSheet />
      <PickerSheet />
      <NumericKeyboard />
    </BottomSheetModalProvider>
  );
};

export default ActionSheetProvider;
