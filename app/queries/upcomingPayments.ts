import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EditUpcomingPayment, NewUpcomingPayment } from "db";
import {
  addUpcomingPayment,
  cancelUpcomingPaymentInstance,
  clearStaleFlag,
  getAllUpcomingPayments,
  getLinkablePendingInstances,
  getUpcomingInstancesForSection,
  getUpcomingPaymentById,
  getUpcomingPaymentInstancesWithContributions,
  getUpcomingPaymentInstanceWithContext,
  restoreUpcomingPayment,
  restoreUpcomingPaymentInstance,
  softDeleteUpcomingPayment,
  updateUpcomingPayment,
} from "app/services/upcomingPaymentQueries";
import { queryKeys } from "./index";

export const useGetUpcomingPayments = () => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.upcomingPayments],
    queryFn: getAllUpcomingPayments,
  });

  return { data: data ?? [], isLoading: isLoading || isFetching, isError };
};
export type UpcomingPaymentRow = ReturnType<typeof useGetUpcomingPayments>["data"][number];

export const useGetUpcomingPaymentById = (id: number | undefined) => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.upcomingPaymentById, id],
    queryFn: () => getUpcomingPaymentById(id as number),
    enabled: typeof id === "number",
  });

  return { data: data ?? null, isLoading: isLoading || isFetching, isError };
};
export type UpcomingPaymentDetailRow = NonNullable<
  ReturnType<typeof useGetUpcomingPaymentById>["data"]
>;

export const useGetUpcomingPaymentInstances = (id: number | undefined) => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.upcomingPaymentInstances, id],
    queryFn: () => getUpcomingPaymentInstancesWithContributions(id as number),
    enabled: typeof id === "number",
  });

  return { data: data ?? [], isLoading: isLoading || isFetching, isError };
};
export type UpcomingPaymentInstanceRow = ReturnType<
  typeof useGetUpcomingPaymentInstances
>["data"][number];

export const useGetUpcomingInstancesForSection = () => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.upcomingInstancesForSection],
    queryFn: getUpcomingInstancesForSection,
  });

  return { data: data ?? [], isLoading: isLoading || isFetching, isError };
};
export type UpcomingInstanceSectionRow = ReturnType<
  typeof useGetUpcomingInstancesForSection
>["data"][number];

const invalidateUpcomingPayments = (clientQuery: ReturnType<typeof useQueryClient>, id?: number) => {
  clientQuery.invalidateQueries({ queryKey: [queryKeys.upcomingPayments] });
  clientQuery.invalidateQueries({ queryKey: [queryKeys.upcomingInstancesForSection] });
  if (typeof id === "number") {
    clientQuery.invalidateQueries({ queryKey: [queryKeys.upcomingPaymentById, id] });
    clientQuery.invalidateQueries({ queryKey: [queryKeys.upcomingPaymentInstances, id] });
  }
};

export const addUpcomingPaymentMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (payment: NewUpcomingPayment) => addUpcomingPayment(payment),
    onSuccess: () => invalidateUpcomingPayments(clientQuery),
  });

  return {
    addUpcomingPayment: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useUpdateUpcomingPaymentMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: ({ id, values }: { id: number; values: EditUpcomingPayment }) =>
      updateUpcomingPayment(id, values),
    onSuccess: (_data, variables) => invalidateUpcomingPayments(clientQuery, variables.id),
  });

  return {
    updateUpcomingPayment: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useGetUpcomingPaymentInstanceContext = (instanceId: number | undefined) => {
  const enabled = typeof instanceId === "number";
  const { data, isLoading, isFetching, isError } = useQuery({
    enabled,
    queryKey: [queryKeys.upcomingPaymentInstanceContext, instanceId],
    queryFn: enabled ? () => getUpcomingPaymentInstanceWithContext(instanceId as number) : skipToken,
  });

  return { data: data ?? null, isLoading: isLoading || isFetching, isError };
};
export type UpcomingPaymentInstanceContext = NonNullable<
  ReturnType<typeof useGetUpcomingPaymentInstanceContext>["data"]
>;

export const useGetLinkablePendingInstances = (
  categoryId: number | null | undefined,
  includeInstanceId?: number | null,
) => {
  const enabled = typeof categoryId === "number";
  const includeKey = includeInstanceId ?? null;
  const { data, isLoading, isFetching, isError } = useQuery({
    enabled,
    queryKey: [queryKeys.linkablePendingInstances, categoryId, includeKey],
    queryFn: enabled
      ? () => getLinkablePendingInstances(categoryId, includeKey)
      : skipToken,
  });

  return { data: data ?? [], isLoading: isLoading || isFetching, isError };
};
export type LinkableInstanceRow = ReturnType<typeof useGetLinkablePendingInstances>["data"][number];

export const useCancelUpcomingPaymentInstanceMutation = (upcomingPaymentId: number) => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (instanceId: number) => cancelUpcomingPaymentInstance(instanceId),
    onSuccess: () => invalidateUpcomingPayments(clientQuery, upcomingPaymentId),
  });

  return {
    cancelInstance: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useRestoreUpcomingPaymentInstanceMutation = (upcomingPaymentId: number) => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (instanceId: number) => restoreUpcomingPaymentInstance(instanceId),
    onSuccess: () => invalidateUpcomingPayments(clientQuery, upcomingPaymentId),
  });

  return {
    restoreInstance: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useClearStaleFlagMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (id: number) => clearStaleFlag(id),
    onSuccess: (_data, id) => invalidateUpcomingPayments(clientQuery, id),
  });

  return {
    clearStaleFlag: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useDeleteUpcomingPaymentMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (id: number) => softDeleteUpcomingPayment(id),
    onSuccess: (_data, id) => invalidateUpcomingPayments(clientQuery, id),
  });

  return {
    deleteUpcomingPayment: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useRestoreUpcomingPaymentMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (id: number) => restoreUpcomingPayment(id),
    onSuccess: (_data, id) => invalidateUpcomingPayments(clientQuery, id),
  });

  return {
    restoreUpcomingPayment: mutate,
    isLoading: isPending,
    isError,
  };
};
