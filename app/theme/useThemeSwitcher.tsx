import colors from "constants/colors";
import { useAppTheme } from "./ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";

export const useThemeSwitcher = () => {
  const { themeMode, setThemeMode, theme } = useAppTheme();

  const themeModes: Array<"light" | "dark" | "auto"> = ["light", "dark", "auto"];

  const changeTheme = () => {
    const currentIndex = themeModes.indexOf(themeMode);
    setThemeMode(themeModes[(currentIndex + 1) % themeModes.length]);
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case "light":
        return <MaterialIcons name='light-mode' size={32} color={theme.colors.text} />;
      case "dark":
        return <MaterialIcons name='dark-mode' size={32} color={theme.colors.text} />;
      default:
        return <MaterialIcons name='brightness-6' size={32} color={theme.colors.text} />;
    }
  };

  return { themeMode, changeTheme, getThemeIcon };
};
