import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./index";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getAllCategoriesWithTypes,
} from "app/services/categoryQueries";
import { CategoriesWithType, EditCategory, NewCategory } from "db";

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

export const useDeleteCategoryMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      clientQuery.invalidateQueries({
        queryKey: [queryKeys.transactions],
      });
      clientQuery.invalidateQueries({ queryKey: [queryKeys.categories] });
      clientQuery.invalidateQueries({
        queryKey: [queryKeys.monthlyBalance],
      });
      clientQuery.invalidateQueries({
        queryKey: [queryKeys.monthlyGraph],
      });
      clientQuery.invalidateQueries({
        queryKey: [queryKeys.wallets],
      });
    },
  });

  return {
    deleteCategory: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useAddCategoryMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (data: NewCategory) => addCategory(data),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.categories] });
    },
  });
  return {
    addCategory: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useEditCategoryMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (data: EditCategory) => editCategory(data),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.categories] });
    },
  });
  return {
    editCategory: mutate,
    isLoading: isPending,
    isError,
  };
};
