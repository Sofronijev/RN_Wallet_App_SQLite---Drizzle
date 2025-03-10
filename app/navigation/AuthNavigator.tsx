import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "./routes";

import PinScreen from "app/features/pinCode/ui/PinScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName='PinCode'
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name='PinCode' component={PinScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
