import React, { FC, PropsWithChildren } from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ActionSheetProvider as ContextProvider } from "./ActionSheetContext";
import ActionSheetManager from "./ActionSheetManager";

const ActionSheetProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ContextProvider>
      <BottomSheetModalProvider>
        {children}
        <ActionSheetManager />
      </BottomSheetModalProvider>
    </ContextProvider>
  );
};

export default ActionSheetProvider;
