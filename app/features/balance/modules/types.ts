import useGetWalletsWithBalance from "../hooks/useGetWalletsWithBalance";

export type WalletType = ReturnType<typeof useGetWalletsWithBalance>[number];
