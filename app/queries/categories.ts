import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./index";
import { getAllCategoriesWithTypes } from "app/services/categoryQueries";
import { CategoriesWithType } from "db";

export const useGetCategories = () => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.categories],
    queryFn: getAllCategoriesWithTypes,
  });
  const categories = data ?? [];

  const normalizedCategories = categories.reduce<{
    categoriesById: Record<number, CategoriesWithType>;
    categoriesAllId: number[];
  }>(
    (acc, item) => {
      acc.categoriesById[item.id] = item;
      acc.categoriesAllId.push(item.id);
      return acc;
    },
    {
      categoriesById: {},
      categoriesAllId: [],
    }
  );

  return {
    data: data ?? [],
    ...normalizedCategories,
    isLoading: isLoading || isFetching,
    isError,
  };
};
