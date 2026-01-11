import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeNavigator from "./HomeNavigator";
import colors from "constants/colors";
import { AppStackParamList } from "./routes";
import TransactionForm from "app/features/balance/ui/TransactionForm/TransactionForm";
import { transactionStrings, transferStrings } from "constants/strings";
import WalletSettings from "app/features/settings/ui/wallets";
import TransferForm from "app/features/balance/ui/TransferFrom/TransferForm";
import TransactionSearch from "app/features/balance/ui/TransactionSearch";
import PinSettings from "app/features/pinCode/ui/PinSettings";
import NumberSeparators from "app/features/settings/ui/NumberSeparators";
import { useColors } from "app/theme/useThemedStyles";
import TransactionFiltersIcon from "app/features/balance/ui/TransactionSearch/TransactionFiltersIcon";
import TransactionFilters from "app/features/balance/ui/TransactionSearch/TransactionFilters";
import { TransactionFiltersProvider } from "app/features/balance/ui/TransactionSearch/context/TransactionFiltersContext";
import CategorySettings from "app/features/settings/ui/categories/CategorySettings";
import CategoryForm from "app/features/settings/ui/categories/CategoryForm";
import HeaderTextButton from "components/Header/HeaderTextButton";
import DashboardSettings from "app/features/settings/ui/dashboard/DashboardSettings";
import { DatabaseBackupScreen } from "app/features/settings/ui/importExport";

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator: React.FC = () => {
  const { header } = useColors();

  return (
    <TransactionFiltersProvider>
      <Stack.Navigator
        initialRouteName='Home'
        screenOptions={{
          headerStyle: {
            backgroundColor: header,
          },
          headerTitleAlign: "center",
          headerTitleStyle: { color: colors.white },
          headerTintColor: colors.white,
        }}
      >
        <Stack.Screen name='Home' component={HomeNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name='Transaction'
          component={TransactionForm}
          options={{
            animation: "slide_from_bottom",
            title: transactionStrings.addTransaction,
          }}
        />
        <Stack.Screen
          name='TransactionSearch'
          component={TransactionSearch}
          options={{
            animation: "slide_from_bottom",
            title: transactionStrings.transactionSearch,
            headerRight: () => <TransactionFiltersIcon />,
          }}
        />
        <Stack.Screen
          name='WalletSettings'
          component={WalletSettings}
          options={{
            animation: "default",
            title: "Wallet settings",
          }}
        />
        <Stack.Screen
          name='TransferForm'
          component={TransferForm}
          options={{
            animation: "slide_from_bottom",
            title: transferStrings.createTransfer,
          }}
        />
        <Stack.Screen
          name='PinSettings'
          component={PinSettings}
          options={{
            animation: "default",
            title: "Pin Code",
          }}
        />
        <Stack.Screen
          name='DashboardSettings'
          component={DashboardSettings}
          options={{
            animation: "default",
            title: "Dashboard settings",
          }}
        />
        <Stack.Screen
          name='NumberSeparators'
          component={NumberSeparators}
          options={{
            animation: "default",
            title: "Number separators",
          }}
        />
        <Stack.Screen
          name='TransactionFilters'
          component={TransactionFilters}
          options={{
            animation: "slide_from_right",
            title: "Filters",
          }}
        />
        <Stack.Screen
          name='CategorySettings'
          component={CategorySettings}
          options={({ navigation }) => ({
            title: "Category settings",
            headerRight: () => (
              <HeaderTextButton onPress={() => navigation.navigate("CategoryForm")}>
                Add new
              </HeaderTextButton>
            ),
          })}
        />
        <Stack.Screen
          name='CategoryForm'
          component={CategoryForm}
          options={{
            animation: "default",
            title: "Add category",
          }}
        />
        <Stack.Screen
          name='ExportImport'
          component={DatabaseBackupScreen}
          options={{
            animation: "default",
            title: "Backup & Restore",
          }}
        />
      </Stack.Navigator>
    </TransactionFiltersProvider>
  );
};

export default AppNavigator;
