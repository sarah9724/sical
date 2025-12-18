import { City, Salary, CalculationResult } from '@/types';

// 本地存储键名
const STORAGE_KEYS = {
  CITIES: 'sical_cities',
  SALARIES: 'sical_salaries',
  RESULTS: 'sical_results',
};

// 城市标准操作
export const localStorageCities = {
  getAll: (): City[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.CITIES);
    return data ? JSON.parse(data) : [];
  },

  insert: async (cities: Omit<City, 'id' | 'created_at' | 'updated_at'>[]) => {
    if (typeof window === 'undefined') return { error: null };

    const existingCities = localStorageCities.getAll();
    const newCities = cities.map((city, index) => ({
      ...city,
      id: Date.now() + index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(newCities));
    return { error: null };
  },

  delete: async () => {
    if (typeof window === 'undefined') return { error: null };
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify([]));
    return { error: null };
  },
};

// 员工工资操作
export const localStorageSalaries = {
  getAll: (): Salary[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SALARIES);
    return data ? JSON.parse(data) : [];
  },

  insert: async (salaries: Omit<Salary, 'id' | 'created_at' | 'updated_at'>[]) => {
    if (typeof window === 'undefined') return { error: null };

    const existingSalaries = localStorageSalaries.getAll();
    const newSalaries = salaries.map((salary, index) => ({
      ...salary,
      id: Date.now() + index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    localStorage.setItem(STORAGE_KEYS.SALARIES, JSON.stringify(newSalaries));
    return { error: null };
  },

  delete: async () => {
    if (typeof window === 'undefined') return { error: null };
    localStorage.setItem(STORAGE_KEYS.SALARIES, JSON.stringify([]));
    return { error: null };
  },
};

// 计算结果操作
export const localStorageResults = {
  getAll: (): CalculationResult[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
    return data ? JSON.parse(data) : [];
  },

  insert: async (results: Omit<CalculationResult, 'id' | 'calculation_date'>[]) => {
    if (typeof window === 'undefined') return { error: null };

    const newResults = results.map((result, index) => ({
      ...result,
      id: Date.now() + index,
      calculation_date: new Date().toISOString(),
    }));

    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(newResults));
    return { error: null };
  },

  delete: async () => {
    if (typeof window === 'undefined') return { error: null };
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
    return { error: null };
  },
};