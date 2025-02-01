import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getShowTotalAmount,
  getPinCode,
  setShowTotalAmount,
  setIsPinEnabled,
  setPinCode,
} from "app/services/userQueries";
import { queryKeys } from "./index";

export const useGetPinCodeDataQuery = () => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.pinCode],
    queryFn: getPinCode,
  });

  return {
    pinCode: data?.pinCode ?? "",
    isPinEnabled: data?.isPinEnabled ?? false,
    isLoading: isLoading || isFetching,
    isError,
  };
};

export const useSetPinCodeMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (pinCode: string) => setPinCode(pinCode),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.pinCode] });
    },
  });

  return {
    setPinCode: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useSetIsPinEnabledMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (isPinEnabled: boolean) => setIsPinEnabled(isPinEnabled),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.pinCode] });
    },
  });

  return {
    setIsPinEnabled: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useGetShowTotalAmount = () => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.showTotalAmount],
    queryFn: getShowTotalAmount,
  });

  return {
    showTotalAmount: data?.showTotalAmount ?? false,
    isLoading: isLoading || isFetching,
    isError,
  };
};

export const useSetShowTotalAmount = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (isHidden: boolean) => setShowTotalAmount(isHidden),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.showTotalAmount] });
    },
  });

  return {
    setShowTotalAmount: mutate,
    isLoading: isPending,
    isError,
  };
};
