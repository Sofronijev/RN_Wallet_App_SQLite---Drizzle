import React, { useState, useEffect, useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import AppNavigator from "./AppNavigator";
import { Alert, View } from "react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";
import { categories, types, users, wallet } from "db/schema";
import Label from "components/Label";
import { db } from "db";
import { sql } from "drizzle-orm";

// SplashScreen.preventAutoHideAsync();

const RootNavigator: React.FC = () => {
  const { success, error } = useMigrations(db, migrations);
  const [items, setItems] = useState<(typeof categories.$inferSelect)[] | null>(null);

  console.log(success);
  console.log(error);
  useEffect(() => {
    if (!success) return;
    (async () => {
      // await db.delete(types);
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
//       const a = db.run(sql`INSERT INTO
//     "Categories" (id, name, type)
// VALUES
//     (1, "income", "system"),
//     (2, "saving", "system"),
//     (3, "gifts", "system"),
//     (4, "housing", "system"),
//     (5, "utilities", "system"),
//     (6, "food", "system"),
//     (7, "transportation", "system"),
//     (8, "health", "system"),
//     (9, "dailyLiving", "system"),
//     (10, "children", "system"),
//     (11, "obligation", "system"),
//     (12, "entertainment", "system"),
//     (13, "other", "system"),
//     (14, "balanceAdjust", "system"),
//     (15, "transfer", "system");`);

      const data = await db.select().from(types);
      // console.log(data);
      setItems(data);
      // setIsReady(true);
    })();
  }, [success]);

  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  // if (error) {
  //   return (
  //     <View>
  //       <Label>Migration error: {error.message}</Label>
  //     </View>
  //   );
  // }
  // if (!success) {
  //   return (
  //     <View>
  //       <Label>Migration is in progress...</Label>
  //     </View>
  //   );
  // }
  // if (items === null || items.length === 0) {
  //   return (
  //     <View>
  //       <Label>Empty</Label>
  //     </View>
  //   );
  // }

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
      {error && <Label>Migration error: {error.message}</Label>}
      {items?.length ? (
        items.map((item) => <Label key={item.id}>{JSON.stringify(item)}</Label>)
      ) : (
        <Label>{"EMPTY ARRAY"}</Label>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppNavigator />
    </View>
  );
};

export default RootNavigator;
