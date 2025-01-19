import React, { FC, PropsWithChildren } from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import TransactionBottomSheet from "./CategoriesSheet";

const ActionSheetProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <BottomSheetModalProvider>
      {children}
      <TransactionBottomSheet />
    </BottomSheetModalProvider>
  );
};

export default ActionSheetProvider;
