import React, { useState, useEffect, useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import AppNavigator from "./AppNavigator";
import { Alert, View } from "react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";
import { categories, users } from "db/schema";
import Label from "components/Label";
import { db } from "db";

// SplashScreen.preventAutoHideAsync();

const RootNavigator: React.FC = () => {
  const { success, error } = useMigrations(db, migrations);
  const [items, setItems] = useState<(typeof categories.$inferSelect)[] | null>(null);
  console.log(success);
  // console.log(error);
  useEffect(() => {
    if (!success) return;
    (async () => {
      // await db.delete(users);
      // await db.insert(users).values([
      //   {
      //     username: "Mike",
      //     email: "john@example.com",
      //   },
      // ]);

      // await db.insert(users).values([
      //   {
      //     username: "Mike",
      //     email: "mike@example.com",
      //   },
      // ]);
      const data = await db.select().from(categories);
      // console.log(data);
      setItems(data);
    })();
  }, [success]);

  const onLayoutRootView = useCallback(async () => {
    if (success) {
      console.log("success");
      const a = await SplashScreen.hideAsync();
      console.log(a);
    }
  }, [success]);

  if (error) {
    return (
      <View>
        <Label>Migration error: {error.message}</Label>
      </View>
    );
  }
  if (!success) {
    return (
      <View>
        <Label>Migration is in progress...</Label>
      </View>
    );
  }
  if (items === null || items.length === 0) {
    return (
      <View>
        <Label>Empty</Label>
      </View>
    );
  }

  return (
    <View
      onLayout={onLayoutRootView}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
        justifyContent: "center",
      }}
    >
      {items.map((item) => (
        <Label key={item.id}>{item.name}</Label>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppNavigator />
    </View>
  );
};

export default RootNavigator;
