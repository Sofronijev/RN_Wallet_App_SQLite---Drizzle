import { db, NewType } from "db";
import { types } from "db/schema";

export const addType = async (data: NewType) =>
  db.insert(types).values({ ...data, type: "custom" });
