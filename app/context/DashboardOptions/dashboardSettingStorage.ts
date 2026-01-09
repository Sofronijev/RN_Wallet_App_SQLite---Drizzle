import { getFromLocalStorage, storeToLocalStorage } from "modules/localStorage";

export type DashboardOptions = {
  showTotalBalance: boolean;
  showMonthlySummary: boolean;
  showBalanceTrend: boolean;
  showRecentTransactions: boolean;
};

const DASHBOARD_OPTIONS_KEY = "DASHBOARD_OPTIONS";

export const defaultDashboardOptions: DashboardOptions = {
  showTotalBalance: true,
  showMonthlySummary: true,
  showBalanceTrend: true,
  showRecentTransactions: true,
};

export const getDashboardOptions = (): DashboardOptions => {
  const stored = getFromLocalStorage<DashboardOptions>(DASHBOARD_OPTIONS_KEY);
  return { ...defaultDashboardOptions, ...(stored || {}) };
};

export const setDashboardOptions = async (options: Partial<DashboardOptions>): Promise<boolean> => {
  try {
    const current = getDashboardOptions();
    const updated = { ...defaultDashboardOptions, ...current, ...options };

    await storeToLocalStorage(DASHBOARD_OPTIONS_KEY, updated);
    return true;
  } catch (err) {
    console.error("Failed to save dashboard options:", err);
    return false;
  }
};

export const resetDashboardOptions = async (): Promise<boolean> => {
  try {
    await storeToLocalStorage(DASHBOARD_OPTIONS_KEY, defaultDashboardOptions);
    return true;
  } catch (err) {
    console.error("Failed to save dashboard options:", err);
    return false;
  }
};
