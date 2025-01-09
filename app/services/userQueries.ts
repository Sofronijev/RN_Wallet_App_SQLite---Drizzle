import { db } from "db";
import { users } from "db/schema";

export const setSelectedWallet = (selectedWalletId: number) => {
  return db.update(users).set({ selectedWalletId });
};

export const getSelectedWalletInfo = () => {
  return db.query.users.findFirst({
    with: {
      selectedWallet: true,
    },
  });
};
