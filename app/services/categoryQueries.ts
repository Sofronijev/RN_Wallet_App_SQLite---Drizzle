import { db, EditCategory, NewCategory } from "db";
import { categories, types } from "db/schema";
import { and, eq, notInArray, sql } from "drizzle-orm";

export const getAllCategoriesWithTypes = () => {
  return db.query.categories.findMany({
    with: {
      types: true,
    },
  });
};

export const deleteCategory = (id: number) => db.delete(categories).where(eq(categories.id, id));

export const addCategory = async (data: NewCategory) => {
  const { types: newTypes, ...category } = data;

  await db.transaction(async (tx) => {
    const [insertedCategory] = await tx
      .insert(categories)
      .values(category)
      .returning({ id: categories.id });

    const catId = insertedCategory.id;

    if (!newTypes?.length) return;

    const formattedTypes = newTypes.map((type) => ({
      ...type,
      categoryId: catId,
    }));

    await tx.insert(types).values(formattedTypes);
  });
};

export const editCategory = async (data: EditCategory) => {
  const { id, types: editedTypes, ...rest } = data;

  await db.transaction(async (tx) => {
    await tx.update(categories).set(rest).where(eq(categories.id, id));

    const existingTypes = editedTypes.filter((t) => t.id != null);
    const newTypes = editedTypes.filter((t) => t.id == null);

    await Promise.all(
      existingTypes.map((t) => tx.update(types).set({ name: t.name }).where(eq(types.id, t.id)))
    );

    const incomingIds = existingTypes.map((t) => t.id);

    await tx
      .delete(types)
      .where(
        and(
          eq(types.categoryId, id),
          incomingIds.length ? notInArray(types.id, incomingIds) : sql`true`
        )
      );

    if (newTypes.length) {
      await tx.insert(types).values(
        newTypes.map((t) => ({
          categoryId: id,
          name: t.name,
          type: t.type,
        }))
      );
    }
  });
};
