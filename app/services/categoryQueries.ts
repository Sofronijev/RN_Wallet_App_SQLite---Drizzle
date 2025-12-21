import { db, NewCategory } from "db";
import { categories } from "db/schema";
import { eq } from "drizzle-orm";

export const getAllCategoriesWithTypes = () => {
  return db.query.categories.findMany({
    with: {
      types: true,
    },
  });
};

export const deleteCategory = (id: number) => db.delete(categories).where(eq(categories.id, id));

export const addCategory = (transaction: NewCategory) =>
  db.insert(categories).values(transaction);
