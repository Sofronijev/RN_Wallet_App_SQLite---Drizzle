import colors from "constants/colors";

export type ButtonType = "primary" | "danger" | "link";

export const buttonColor: Record<ButtonType, string> = {
  primary: colors.greenMint,
  danger: colors.danger,
  link: colors.hyperlink,
};
