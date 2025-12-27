import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addType } from "app/services/typeQueries";
import { NewType } from "db";
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
