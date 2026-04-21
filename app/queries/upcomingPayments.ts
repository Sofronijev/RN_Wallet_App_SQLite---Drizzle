import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NewUpcomingPayment } from "db";
import { addUpcomingPayment, getAllUpcomingPayments } from "app/services/upcomingPaymentQueries";
import { queryKeys } from "./index";

export const useGetUpcomingPayments = () => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.upcomingPayments],
    queryFn: getAllUpcomingPayments,
  });

  return { data: data ?? [], isLoading: isLoading || isFetching, isError };
};
export type UpcomingPaymentRow = ReturnType<typeof useGetUpcomingPayments>["data"][number];

export const addUpcomingPaymentMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (payment: NewUpcomingPayment) => addUpcomingPayment(payment),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.upcomingPayments] });
    },
  });

  return {
    addUpcomingPayment: mutate,
    isLoading: isPending,
    isError,
  };
};
