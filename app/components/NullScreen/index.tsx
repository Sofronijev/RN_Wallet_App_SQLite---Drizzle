import { StyleSheet, View } from "react-native";
import React from "react";
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from "@expo/vector-icons";
import colors from "constants/colors";
import AppActivityIndicator from "components/AppActivityIndicator";
import Label from "components/Label";
import ButtonText from "components/ButtonText";

const nullScreenIcon = {
  wallet: <Ionicons name='wallet-outline' size={100} color={colors.greyNullScreen} />,
  chart: <MaterialCommunityIcons name='finance' size={100} color={colors.greyNullScreen} />,
  search: <MaterialIcons name='search' size={100} color={colors.greyNullScreen} />,
};

type IconTypes = keyof typeof nullScreenIcon;

type NullScreenProps = {
  title: string;
  icon: IconTypes;
  subtitle?: string;
  isLoading?: boolean;
  buttonText?: string;
  onPress?: () => void;
};

const NullScreen: React.FC<NullScreenProps> = ({
  isLoading = false,
  title,
  subtitle,
  icon,
  buttonText,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      {nullScreenIcon[icon]}
      <Label style={styles.title}>{title}</Label>
      <Label style={styles.description}>{subtitle}</Label>
      {buttonText && onPress && (
        <ButtonText buttonStyle={styles.button} title={buttonText} onPress={onPress} />
      )}
      <AppActivityIndicator isLoading={isLoading} />
    </View>
  );
};

export default NullScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    paddingVertical: 12,
    fontSize: 16,
    paddingHorizontal: 16,
    textAlign: "center",
  },
  description: {
    paddingHorizontal: 16,
    textAlign: "center",
    paddingBottom: 15,
  },
  button: {
    textTransform: "uppercase",
    fontWeight: "bold",
  },
});
