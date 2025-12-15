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
  categories: [],
  types: [],
};

type Filters = {
  categories: number[];
  types: number[];
};

type TransactionFiltersContextType = {
  filters: Filters;
  filtersCounter: number;
  selectedCategories: SelectedCategories;
  onCategoriesSelect: (data: SelectedCategories) => void;
  onCategoryDelete: (id: number) => void;
  selectedTypes: SelectedTypes;
  onTypeSelect: (categoryId: number, typeId: number) => void;
  applyFilters: () => void;
  resetFilters: () => void;
};

const TransactionFiltersContext = createContext<TransactionFiltersContextType | undefined>(
  undefined
);

type SelectedCategories = Record<CategoriesWithType["id"], boolean>;
type SelectedTypes = Record<number, Record<number, boolean>>;

export const TransactionFiltersProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>({});
  const [selectedTypes, setSelectedTypes] = useState<SelectedTypes>({});
  const [savedFilters, setSavedFilters] = useState<Filters>(initialFilters);

  const onCategoriesSelect = useCallback((data: SelectedCategories) => {
    setSelectedCategories(data);
  }, []);

  const onCategoryDelete = useCallback((id: number) => {
    setSelectedCategories((prev) => {
      const { [id]: _deleted, ...rest } = prev;
      return rest;
    });
    setSelectedTypes((prev) => {
      const { [id]: _deleted, ...rest } = prev;
      return rest;
    });
  }, []);

  const onTypeSelect = useCallback((categoryId: number, typeId: number) => {
    setSelectedTypes((prev) => {
      const categoryTypes = prev[categoryId] ?? {};

      if (categoryTypes[typeId]) {
        const { [typeId]: _removed, ...restTypes } = categoryTypes;

        return {
          ...prev,
          [categoryId]: restTypes,
        };
      }

      return {
        ...prev,
        [categoryId]: {
          ...categoryTypes,
          [typeId]: true,
        },
      };
    });
  }, []);

  const selectedCategoriesArray = useMemo(
    () => objectKeys(selectedCategories),
    [selectedCategories]
  );

  const selectedTypesArray = useMemo(
    () =>
      objectKeys(selectedTypes).flatMap((categoryId) =>
        objectKeys(selectedTypes[categoryId]).map(Number)
      ),
    [selectedTypes]
  );

  const filtersCounter = useMemo(
    () => (selectedCategoriesArray.length > 0 ? 1 : 0) + (selectedTypesArray.length > 0 ? 1 : 0),
    [selectedCategoriesArray.length, selectedTypesArray.length]
  );

  const applyFilters = useCallback(() => {
    setSavedFilters({
      categories: selectedCategoriesArray.map(Number),
      types: selectedTypesArray,
    });
  }, [selectedCategoriesArray, selectedTypesArray]);

  const resetFilters = useCallback(() => {
    setSelectedCategories({});
    setSelectedTypes({});
  }, []);

  const filters = useMemo(
    () => ({
      categories: selectedCategoriesArray.map(Number),
      types: selectedTypesArray,
    }),
    [selectedCategoriesArray, selectedTypesArray]
  );

  const contextValue = useMemo<TransactionFiltersContextType>(
    () => ({
      filters,
      selectedCategories,
      onCategoriesSelect,
      onCategoryDelete,
      onTypeSelect,
      selectedTypes,
      filtersCounter,
      applyFilters,
      resetFilters,
    }),
    [
      savedFilters,
      selectedCategories,
      onCategoriesSelect,
      onCategoryDelete,
      onTypeSelect,
      selectedTypes,
      filtersCounter,
      applyFilters,
      resetFilters,
    ]
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
