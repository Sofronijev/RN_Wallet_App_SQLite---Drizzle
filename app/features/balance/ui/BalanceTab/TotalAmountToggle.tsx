import React, { FC } from "react";
import VisibilityToggleIcon from "components/VisibilityToggleIcon";
import { useGetShowTotalAmount, useSetShowTotalAmount } from "app/queries/user";

const TotalAmountToggle: FC = () => {
  const { showTotalAmount } = useGetShowTotalAmount();
  const { setShowTotalAmount } = useSetShowTotalAmount();

  const onIsVisiblePress = (isVisible: boolean) => {
    setShowTotalAmount(isVisible);
  };

  return <VisibilityToggleIcon isVisible={showTotalAmount} onPress={onIsVisiblePress} />;
};

export default TotalAmountToggle;
