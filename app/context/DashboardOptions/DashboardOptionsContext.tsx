import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  DashboardOptions,
  defaultDashboardOptions,
  getDashboardOptions,
  setDashboardOptions,
} from "./dashboardSettingStorage";

type DashboardOptionsContextType = {
  options: DashboardOptions;
  updateOption: (options: Partial<DashboardOptions>) => void;
  resetOptions: () => void;
};

const DashboardOptionsContext = createContext<DashboardOptionsContextType | undefined>(undefined);

export const DashboardOptionsProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<DashboardOptions>(defaultDashboardOptions);

  useEffect(() => {
    const stored = getDashboardOptions();
    setOptions(stored);
  }, []);

  const updateOption = (updatedOptions: Partial<DashboardOptions>) => {
    const updated = { ...options, ...updatedOptions };
    setOptions(updated);
    setDashboardOptions(updated);
  };

  const resetOptions = () => {
    setOptions(defaultDashboardOptions);
    setDashboardOptions(defaultDashboardOptions);
  };

  return (
    <DashboardOptionsContext.Provider value={{ options, updateOption, resetOptions }}>
      {children}
    </DashboardOptionsContext.Provider>
  );
};

export const useDashboardOptions = () => {
  const context = useContext(DashboardOptionsContext);
  if (!context)
    throw new Error("useDashboardOptions must be used within a DashboardOptionsProvider");
  return context;
};
