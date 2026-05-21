import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
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
  recreatePaymentNotifications,
  restoreUpcomingPayment,
  restoreUpcomingPaymentInstance,
  softDeleteUpcomingPayment,
  updateUpcomingPayment,
} from "app/services/upcomingPaymentQueries";
import { ScheduleResult } from "app/services/notificationQueries";
import { queryKeys } from "./index";

const showScheduleFailureAlert = (result: ScheduleResult) => {
  if (result.ok) return;
  if (result.reason === "limit") {
    Alert.alert(
      "Reminder limit reached",
      "iOS allows at most 64 scheduled reminders. Your payment was saved, but no reminder could be added for it. Cancel some reminders or remove an older upcoming payment to free up slots.",
    );
    return;
  }
  Alert.alert(
    "Couldn't schedule reminder",
    "Your payment was saved, but the reminder couldn't be scheduled. You can try Recreate from the payment's detail screen.",
  );
};

export const useGetUpcomingPayments = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKeys.upcomingPayments],
    queryFn: getAllUpcomingPayments,
  });

  return { data: data ?? [], isLoading, isError };
};
export type UpcomingPaymentRow = ReturnType<typeof useGetUpcomingPayments>["data"][number];

export const useGetUpcomingPaymentById = (id: number | undefined) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKeys.upcomingPaymentById, id],
    queryFn: () => getUpcomingPaymentById(id as number),
    enabled: typeof id === "number",
  });

  return { data: data ?? null, isLoading, isError };
};
export type UpcomingPaymentDetailRow = NonNullable<
  ReturnType<typeof useGetUpcomingPaymentById>["data"]
>;

export const useGetUpcomingPaymentInstances = (id: number | undefined) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKeys.upcomingPaymentInstances, id],
    queryFn: () => getUpcomingPaymentInstancesWithContributions(id as number),
    enabled: typeof id === "number",
  });

  return { data: data ?? [], isLoading, isError };
};
export type UpcomingPaymentInstanceRow = ReturnType<
  typeof useGetUpcomingPaymentInstances
>["data"][number];

export const useGetUpcomingInstancesForSection = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKeys.upcomingInstancesForSection],
    queryFn: getUpcomingInstancesForSection,
  });

  return { data: data ?? [], isLoading, isError };
};
export type UpcomingInstanceSectionRow = ReturnType<
  typeof useGetUpcomingInstancesForSection
>["data"][number];

export const invalidateUpcomingPayments = (
  clientQuery: ReturnType<typeof useQueryClient>,
  id?: number,
) => {
  clientQuery.invalidateQueries({ queryKey: [queryKeys.upcomingPayments] });
  clientQuery.invalidateQueries({ queryKey: [queryKeys.upcomingInstancesForSection] });
  clientQuery.invalidateQueries({ queryKey: [queryKeys.linkablePendingInstances] });
  if (typeof id === "number") {
    clientQuery.invalidateQueries({ queryKey: [queryKeys.upcomingPaymentById, id] });
    clientQuery.invalidateQueries({ queryKey: [queryKeys.upcomingPaymentInstances, id] });
  } else {
    clientQuery.invalidateQueries({ queryKey: [queryKeys.upcomingPaymentById] });
    clientQuery.invalidateQueries({ queryKey: [queryKeys.upcomingPaymentInstances] });
  }
};

export const addUpcomingPaymentMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (payment: NewUpcomingPayment) => addUpcomingPayment(payment),
    onSuccess: (result) => {
      invalidateUpcomingPayments(clientQuery);
      showScheduleFailureAlert(result);
    },
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
    onSuccess: (result, variables) => {
      invalidateUpcomingPayments(clientQuery, variables.id);
      showScheduleFailureAlert(result);
    },
  });

  return {
    updateUpcomingPayment: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useGetUpcomingPaymentInstanceContext = (instanceId: number | undefined) => {
  const enabled = typeof instanceId === "number";
  const { data, isLoading, isError } = useQuery({
    enabled,
    queryKey: [queryKeys.upcomingPaymentInstanceContext, instanceId],
    queryFn: enabled ? () => getUpcomingPaymentInstanceWithContext(instanceId as number) : skipToken,
  });

  return { data: data ?? null, isLoading, isError };
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
  const { data, isLoading, isError } = useQuery({
    enabled,
    queryKey: [queryKeys.linkablePendingInstances, categoryId, includeKey],
    queryFn: enabled
      ? () => getLinkablePendingInstances(categoryId, includeKey)
      : skipToken,
  });

  return { data: data ?? [], isLoading, isError };
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
    onSuccess: (result, id) => {
      invalidateUpcomingPayments(clientQuery, id);
      showScheduleFailureAlert(result);
    },
  });

  return {
    restoreUpcomingPayment: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useRecreatePaymentNotificationsMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (id: number) => recreatePaymentNotifications(id),
    onSuccess: (result, id) => {
      invalidateUpcomingPayments(clientQuery, id);
      if (result.ok) {
        Alert.alert("Reminders recreated", "Reminders for this payment are scheduled again.");
      } else {
        showScheduleFailureAlert(result);
      }
    },
  });

  return {
    recreateNotifications: mutate,
    isLoading: isPending,
    isError,
  };
};
