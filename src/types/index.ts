export interface City {
  id: number;
  city_name: string;
  year: string;
  base_min: number;
  base_max: number;
  rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface Salary {
  id: number;
  employee_id: string;
  employee_name: string;
  city: string;
  month: string;
  salary_amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface CalculationResult {
  id: number;
  employee_id: string;
  employee_name: string;
  city: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
  calculation_date?: string;
}

export interface CityUploadData {
  city_name: string;
  year: string;
  base_min: number;
  base_max: number;
  rate: number;
}

export interface SalaryUploadData {
  employee_id: string;
  employee_name: string;
  city: string;
  month: string;
  salary_amount: number;
}