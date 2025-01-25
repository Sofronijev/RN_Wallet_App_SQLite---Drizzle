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

  const categoriesById = categories.reduce<Record<number, CategoriesWithType>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  return {
    data: data ?? [],
    categoriesById,
    isLoading: isLoading || isFetching,
    isError,
  };
};
