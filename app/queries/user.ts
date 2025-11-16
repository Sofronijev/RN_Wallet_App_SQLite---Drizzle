import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getShowTotalAmount,
  getPinCode,
  setShowTotalAmount,
  setIsPinEnabled,
  setPinCode,
  setInactivePinTimeout,
  getNumberSeparator,
  setDecimal,
  setDelimiter,
} from "app/services/userQueries";
import { queryKeys } from "./index";
import { Decimal, Delimiter } from "modules/types";

export const useGetPinCodeDataQuery = () => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.pinCode],
    queryFn: getPinCode,
  });

  return {
    pinCode: data?.pinCode ?? "",
    isPinEnabled: data?.isPinEnabled ?? false,
    inactivePinTimeout: data?.inactivePinTimeout ?? null,
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
export const useSetInactivePinTimeoutMutation = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (time: number | null) => setInactivePinTimeout(time),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.pinCode] });
    },
  });

  return {
    setInactivePinTimeout: mutate,
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

export const useGetNumberSeparatorQuery = () => {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [queryKeys.numberSeparator],
    queryFn: getNumberSeparator,
  });

  return {
    decimal: data?.decimal ?? ",",
    delimiter: data?.delimiter ?? ".",
    isLoading: isLoading || isFetching,
    isError,
  };
};

export const useSetDecimal = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (decimal: Decimal) => setDecimal(decimal),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.numberSeparator] });
    },
  });

  return {
    setDecimal: mutate,
    isLoading: isPending,
    isError,
  };
};

export const useSetDelimiter = () => {
  const clientQuery = useQueryClient();
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (delimiter: Delimiter) => setDelimiter(delimiter),
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: [queryKeys.numberSeparator] });
    },
  });

  return {
    setDelimiter: mutate,
    isLoading: isPending,
    isError,
  };
};
