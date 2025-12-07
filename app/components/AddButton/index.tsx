import colors from "constants/colors";
import React from "react";
import { TouchableOpacity, StyleSheet, View, Platform } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "navigation/routes";
import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";

interface AddButtonProps {}

const AddButton: React.FC<AddButtonProps> = ({}) => {
  const styles = useThemedStyles(themedStyles);
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Transaction")} style={styles.button}>
        <Entypo name='plus' size={35} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const themedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 20,
      right: 20,
    },
    button: {
      backgroundColor: colors.greenMint,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",

      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
  });

export default AddButton;
