import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./index";
import { getAllCategoriesWithTypes } from "app/services/categoryQueries";

export const useGetCategories = () => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.categories],
    queryFn: getAllCategoriesWithTypes,
  });

  return {
    data: data ?? [],
    isLoading: isLoading || isFetching,
    isError,
  };
};
