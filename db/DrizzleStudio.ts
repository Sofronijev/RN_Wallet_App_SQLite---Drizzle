import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import React from "react";
import { expoDb } from "db";

const DrizzleStudio: React.FC = () => {
  useDrizzleStudio(expoDb ?? null);
  return null;
};

export default DrizzleStudio;
