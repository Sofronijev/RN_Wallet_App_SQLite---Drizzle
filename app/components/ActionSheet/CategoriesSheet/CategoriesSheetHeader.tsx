import React from "react";
import colors from "constants/colors";
import { FontAwesome } from "@expo/vector-icons";
import SheetHeader from "../components/SheetHeader";
import { Category } from "db";

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
      title={!!selectedCategory ? selectedCategory.name : "Pick category"}
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
