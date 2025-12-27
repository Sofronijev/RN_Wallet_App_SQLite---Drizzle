import { db, NewType } from "db";
import { types } from "db/schema";
import { eq } from "drizzle-orm";

export const addType = async (data: NewType) =>
  db.insert(types).values({ ...data, type: "custom" });

export const getTypeByCategoryId = (categoryId: number) => {
  return db.query.types.findMany({
    where: eq(types.categoryId, categoryId),
  });
};
