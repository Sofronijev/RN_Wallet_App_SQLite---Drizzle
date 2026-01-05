import { db, NewType } from "db";
import { types } from "db/schema";
import { eq, sql } from "drizzle-orm";

export const addType = async (data: NewType) => {
  await db.transaction(async (tx) => {
    const [lastOrder] = await tx
      .select({ max: sql<number>`max(${types.sortOrder})` })
      .from(types)
      .where(eq(types.categoryId, data.categoryId));

    const nextSortOrder = (lastOrder?.max ?? 0) + 10;

    await tx.insert(types).values({
      ...data,
      type: "custom",
      sortOrder: nextSortOrder,
    });
  });
};

export const getTypeByCategoryId = (categoryId: number) => {
  return db.query.types.findMany({
    where: eq(types.categoryId, categoryId),
  });
};
