import { AppTheme } from "app/theme/useThemedStyles";

export type ButtonType = "primary" | "danger" | "link";

export const buttonColor = (theme: AppTheme): Record<ButtonType, string> => ({
  primary: theme.colors.primary,
  danger: theme.colors.danger,
  link: theme.colors.hyperlink,
});
