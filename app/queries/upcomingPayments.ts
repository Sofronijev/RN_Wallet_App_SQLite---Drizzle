import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NewUpcomingPayment } from "db";
import { addUpcomingPayment } from "app/services/upcomingPaymentQueries";
import { queryKeys } from "./index";

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
