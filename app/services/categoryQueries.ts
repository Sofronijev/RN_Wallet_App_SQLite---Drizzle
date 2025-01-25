import { db } from "db";

export const getAllCategoriesWithTypes = () => {
  return db.query.categories.findMany({
    with: {
      types: true,
    },
  });
};
