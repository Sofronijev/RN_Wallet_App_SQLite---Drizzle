import { CategoriesWithType } from "db";
import { objectKeys } from "modules/utils";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

const initialFilters: Filters = {
  categories: {},
  types: {},
};

export type SelectedCategories = Record<CategoriesWithType["id"], boolean>;
export type SelectedTypes = Record<number, Record<number, boolean>>;

type Filters = {
  categories: SelectedCategories;
  types: SelectedTypes;
};

type TransactionFiltersContextType = {
  filters: Filters;
  filtersCounter: number;
  applyFilters: (filters: Filters) => void;
  resetFilters: () => void;
};

const TransactionFiltersContext = createContext<TransactionFiltersContextType | undefined>(
  undefined
);

export const TransactionFiltersProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [savedFilters, setSavedFilters] = useState<Filters>(initialFilters);

  const filtersCounter = useMemo(() => {
    const hasCategories = objectKeys(savedFilters.categories).length > 0;
    const hasTypes = Object.values(savedFilters.types).some((typesById) =>
      Object.values(typesById).some(Boolean)
    );

    return (hasCategories ? 1 : 0) + (hasTypes ? 1 : 0);
  }, [savedFilters]);

  const applyFilters = useCallback((filters: Filters) => {
    setSavedFilters(filters);
  }, []);

  const resetFilters = useCallback(() => {
    setSavedFilters(initialFilters);
  }, []);

  const contextValue = useMemo<TransactionFiltersContextType>(
    () => ({
      filters: savedFilters,
      filtersCounter,
      applyFilters,
      resetFilters,
    }),
    [savedFilters, filtersCounter, applyFilters, resetFilters]
  );

  return (
    <TransactionFiltersContext.Provider value={contextValue}>
      {children}
    </TransactionFiltersContext.Provider>
  );
};

export const useTransactionFilters = () => {
  const context = useContext(TransactionFiltersContext);
  if (!context)
    throw new Error("useTransactionFilters must be used within TransactionFiltersProvider");
  return context;
};
