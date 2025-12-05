import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  PropsWithChildren,
  FC,
} from "react";
import { SheetPropsMap, SHEETS } from "./ActionSheetManager";

// // Checks if all props inside object are optional
type AllOptionalProps<T> = Partial<T> extends T ? true : false;
// // If all props are optional then props will be optional also (this will cover case when same modal is used for create and edit (edits needs some id))
export type SheetItemProps<K extends keyof SheetPropsMap> = AllOptionalProps<
  SheetPropsMap[K]
> extends true
  ? {
      type: K;
      props?: K extends keyof SheetPropsMap ? SheetPropsMap[K] : undefined;
    }
  : {
      type: K;
      props: K extends keyof SheetPropsMap ? SheetPropsMap[K] : undefined;
    };

export type SheetItem = {
  [K in keyof typeof SHEETS]: K extends keyof SheetPropsMap ? SheetItemProps<K> : { type: K };
}[keyof typeof SHEETS];

type SheetContextValue = {
  activeSheet: SheetItem | null;
  openSheet: (sheet: SheetItem) => void;
  closeSheet: (type?: SheetItem["type"]) => void;
};

const initialValue = {
  activeSheet: null,
  openSheet: () => undefined,
  closeSheet: () => undefined,
};

const ActionSheetContext = createContext<SheetContextValue>(initialValue);

export const ActionSheetProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeSheet, setActiveSheet] = useState<SheetItem | null>(null);

  const openSheet = useCallback(<K extends keyof SheetPropsMap>(sheet: SheetItemProps<K>) => {
    setActiveSheet(sheet as SheetItem);
  }, []);

  const closeSheet = useCallback((type?: SheetItem["type"]) => {
    if (type) {
      setActiveSheet((prevType) => {
        return prevType?.type === type ? null : prevType;
      });
    } else {
      setActiveSheet(null);
    }
  }, []);

  const value: SheetContextValue = {
    activeSheet,
    openSheet,
    closeSheet,
  };

  return <ActionSheetContext.Provider value={value}>{children}</ActionSheetContext.Provider>;
};

export const useActionSheet = () => {
  const context = useContext(ActionSheetContext);

  if (!context) {
    throw new Error("useActionSheet must be used within ActionSheetProvider");
  }
  return context;
};
