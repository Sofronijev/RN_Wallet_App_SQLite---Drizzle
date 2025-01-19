import React from "react";
import colors from "constants/colors";
import { Category } from "modules/transactionCategories";
import { FontAwesome } from "@expo/vector-icons";
import SheetHeader from "../components/SheetHeader";

type CategoriesSheetHeaderProps = {
  onBack: () => void;
  selectedCategory: Category | null;
};

const CategoriesSheetHeader: React.FC<CategoriesSheetHeaderProps> = ({
  onBack,
  selectedCategory,
}) => {
  return (
    <SheetHeader
      title={!!selectedCategory ? selectedCategory.label : "Pick category"}
      onBack={onBack}
      backText={
        !!selectedCategory ? (
          <FontAwesome name='chevron-left' size={25} color={colors.black} />
        ) : undefined
      }
    />
  );
};

export default CategoriesSheetHeader;
