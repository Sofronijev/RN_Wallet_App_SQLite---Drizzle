import { ComponentProps } from "react";
import { useActionSheet } from "./ActionSheetContext";
import ColorSheet from "./ColorSheet";
import CategoriesSheet from "./CategoriesSheet";
import NumericKeyboard from "./NumbericKeyboard";
import CurrencySheet from "./CurrencySheet";
import PickerSheet from "./PickerSheet";

export const SHEETS = {
  COLOR_PICKER: "COLOR_PICKER",
  CATEGORY_PICKER: "CATEGORY_PICKER",
  NUMERIC_KEYBOARD: "NUMERIC_KEYBOARD",
  CURRENCY_PICKER: "CURRENCY_PICKER",
  PICKER_SHEET: "PICKER_SHEET",
} as const;

export type SheetPropsMap = {
  [SHEETS.COLOR_PICKER]: ComponentProps<typeof ColorSheet>;
  [SHEETS.CATEGORY_PICKER]: ComponentProps<typeof CategoriesSheet>;
  [SHEETS.NUMERIC_KEYBOARD]: ComponentProps<typeof NumericKeyboard>;
  [SHEETS.CURRENCY_PICKER]: ComponentProps<typeof CurrencySheet>;
  [SHEETS.PICKER_SHEET]: ComponentProps<typeof PickerSheet>;
};

const ActionSheetManager = () => {
  const { activeSheet } = useActionSheet();

  if (!activeSheet) return null;

  const renderSheet = () => {
    const { type } = activeSheet;

    switch (type) {
      case SHEETS.COLOR_PICKER:
        return <ColorSheet {...activeSheet.props} />;
      case SHEETS.CATEGORY_PICKER:
        return <CategoriesSheet {...activeSheet.props} />;
      case SHEETS.NUMERIC_KEYBOARD:
        return <NumericKeyboard {...activeSheet.props} />;
      case SHEETS.CURRENCY_PICKER:
        return <CurrencySheet {...activeSheet.props} />;
      case SHEETS.PICKER_SHEET:
        return <PickerSheet {...activeSheet.props} />;

      default:
        return null;
    }
  };

  return renderSheet();
};

export default ActionSheetManager;
