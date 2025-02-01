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

export const getPinCode = () => {
  return db.query.users.findFirst({
    columns: {
      pinCode: true,
      isPinEnabled: true,
    },
  });
};

export const setPinCode = (pinCode: string) => {
  return db.update(users).set({ pinCode });
};

export const setIsPinEnabled = (isPinEnabled: boolean) => {
  return db.update(users).set({ isPinEnabled });
};

export const getHideTotalAmount = () => {
  return db.query.users.findFirst({
    columns: {
      hideTotalAmount: true,
    },
  });
};

export const setHideTotalAmount = (hideTotalAmount: boolean) => {
  return db.update(users).set({ hideTotalAmount });
};
