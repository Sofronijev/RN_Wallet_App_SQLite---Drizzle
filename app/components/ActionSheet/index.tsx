import React, { FC, PropsWithChildren } from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import TransactionBottomSheet from "./CategoriesSheet";
import CurrencySheet from "./CurrencySheet";

const ActionSheetProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <BottomSheetModalProvider>
      {children}
      <TransactionBottomSheet />
      <CurrencySheet />
    </BottomSheetModalProvider>
  );
};

export default ActionSheetProvider;
