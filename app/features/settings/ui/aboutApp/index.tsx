import { AppTheme, useThemedStyles } from "app/theme/useThemedStyles";
import Label from "components/Label";
import ShadowBoxView from "components/ShadowBoxView";
import colors from "constants/colors";
import React, { FC } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Linking,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";

const AboutScreen: FC = () => {
  const styles = useThemedStyles(themeStyles);
  const email = "SpendyFly@gmail.com";
  const storeName = Platform.OS === "ios" ? "App Store" : "Play Store";
  const appStoreId = "";
  const packageName = ""; //"com.milos.budgetapp";

  const openEmail = () => Linking.openURL(`mailto:${email}`);

  const openStoreReview = () => {
    if (Platform.OS === "ios") {
      Linking.openURL(`https://apps.apple.com/app/id${appStoreId}?action=write-review`);
    } else {
      Linking.openURL(`https://play.google.com/store/apps/details?id=${packageName}&reviewId=0`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image source={require("../../../../assets/icon.png")} style={styles.logo} />
        <Label style={styles.headerTitle}>About</Label>
        <Label style={styles.headerSubtitle}>Information about this app</Label>
      </View>

      <ShadowBoxView style={styles.card}>
        <Label style={styles.sectionTitle}>About the App</Label>
        <Label style={styles.text}>
          The app was created to help track personal finances in a simple way.
          {"\n\n"}
          It was originally built for personal use and later published for anyone who might find it
          useful for managing their budget and expenses.
          {"\n\n"}
          This is a solo project, designed and developed by Miloš S.
        </Label>
      </ShadowBoxView>

      <ShadowBoxView style={styles.card}>
        <Label style={styles.sectionTitle}>Privacy & Disclaimer</Label>
        <Label style={styles.text}>
          All data entered into the app is stored locally on your device. The app does not collect,
          share, or send any personal information to external servers.
          {"\n\n"}
          Users are responsible for backing up their own data. You can export your data to save it
          and import it later if needed.
          {"\n\n"}
          This app is for personal budgeting and informational purposes only and does not provide
          financial advice. Please consult a financial professional for investment decisions.
        </Label>
      </ShadowBoxView>

      <ShadowBoxView style={styles.card}>
        <Label style={styles.sectionTitle}>Built With</Label>
        <Label style={styles.text}>
          This app is powered by modern, open-source technologies:
          {"\n\n"}• React Native & Expo - Cross-platform framework
          {"\n"}• SQLite & Drizzle ORM - Local database
          {"\n"}• React Navigation - Screen navigation
          {"\n"}• React Query - Data management
          {"\n\n"}
          Special thanks to the open-source community for making these tools available.
        </Label>
      </ShadowBoxView>

      <ShadowBoxView style={styles.card}>
        <Label style={styles.sectionTitle}>Feedback & Support</Label>
        <Label style={styles.text}>
          If you have suggestions, feedback, or notice an issue, feel free to reach out:
        </Label>

        <TouchableOpacity onPress={openEmail} style={styles.emailButton}>
          <Label style={styles.emailText}>{email}</Label>
        </TouchableOpacity>

        <Label style={styles.text}>
          {"\n"}If you enjoy using the app, leaving a review on the {storeName} is greatly
          appreciated!
        </Label>

        {/* <TouchableOpacity onPress={openStoreReview} style={styles.reviewButton}>
          <Label style={styles.reviewButtonText}>Leave a Review</Label>
        </TouchableOpacity> */}
      </ShadowBoxView>

      <ShadowBoxView style={styles.footer}>
        <Label style={styles.footerText}>Version 1.0.0</Label>
        <Label style={styles.footerText}>© 2025 SpendyFly</Label>
      </ShadowBoxView>
    </ScrollView>
  );
};

export default AboutScreen;

const themeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 24,
      paddingTop: 8,
      alignItems: "center",
    },
    logo: { width: 100, height: 100 },
    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 15,
    },
    card: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 12,
    },
    text: {
      fontSize: 15,
      lineHeight: 22,
    },
    emailButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginTop: 12,
      borderWidth: 1,
      borderColor: "#2f80ed20",
    },
    emailText: {
      fontSize: 15,
      color: colors.white,
      fontWeight: "500",
      textAlign: "center",
    },
    reviewButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginTop: 12,
    },
    reviewButtonText: {
      fontSize: 15,
      color: colors.white,
      fontWeight: "600",
      textAlign: "center",
    },
    footer: {
      alignItems: "center",
      marginTop: 24,
      paddingVertical: 4,
    },
    footerText: {
      fontSize: 13,
      color: theme.colors.placeholder,
      marginBottom: 4,
    },
  });
