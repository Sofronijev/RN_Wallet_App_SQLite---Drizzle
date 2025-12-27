import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addType, getTypeByCategoryId } from "app/services/typeQueries";
import { NewType, Type } from "db";
import { queryKeys } from "./index";

export const useAddTypeMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: Omit<NewType, "type" | "id">) => addType(data),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.categories] });
    },
  });
  return {
    addType: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useGetTypesByCategoryId = (categoryId: number) => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.types, categoryId],
    queryFn: () => getTypeByCategoryId(categoryId),
    enabled: !!categoryId,
  });
  const types = data ?? [];

  const normalizedTypes = types.reduce<{
    typesById: Record<number, Type>;
    typesAllId: number[];
  }>(
    (acc, item) => {
      acc.typesById[item.id] = item;
      acc.typesAllId.push(item.id);
      return acc;
    },
    {
      typesById: {},
      typesAllId: [],
    }
  );

  return {
    data: types,
    isLoading: isLoading || isFetching,
    isError,
    ...normalizedTypes,
  };
};
