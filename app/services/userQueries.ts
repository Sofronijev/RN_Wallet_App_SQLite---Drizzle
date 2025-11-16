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
      inactivePinTimeout: true,
    },
  });
};

export const setPinCode = (pinCode: string) => {
  return db.update(users).set({ pinCode });
};

export const setIsPinEnabled = (isPinEnabled: boolean) => {
  return db.update(users).set({ isPinEnabled });
};

export const setInactivePinTimeout = (inactivePinTimeout: number | null) => {
  return db.update(users).set({ inactivePinTimeout });
};

export const getShowTotalAmount = () => {
  return db.query.users.findFirst({
    columns: {
      showTotalAmount: true,
    },
  });
};

export const setShowTotalAmount = (showTotalAmount: boolean) => {
  return db.update(users).set({ showTotalAmount });
};

export const getNumberSeparator = () => {
  return db.query.users.findFirst({
    columns: {
      decimal: true,
      delimiter: true,
    },
  });
};
