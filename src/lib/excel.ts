import * as XLSX from 'xlsx';
import type { CityUploadData, SalaryUploadData } from '@/types';

export function parseCitiesExcel(buffer: Buffer): CityUploadData[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];

  return data.map(row => ({
    city_name: String(row.city_name || row['城市名'] || ''),
    year: String(row.year || row['年份'] || ''),
    base_min: Number(row.base_min || row['基数下限'] || 0),
    base_max: Number(row.base_max || row['基数上限'] || 0),
    rate: Number(row.rate || row['缴纳比例'] || 0),
  }));
}

export function parseSalariesExcel(buffer: Buffer): SalaryUploadData[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];

  return data.map(row => ({
    employee_id: String(row.employee_id || row['员工工号'] || ''),
    employee_name: String(row.employee_name || row['员工姓名'] || ''),
    month: String(row.month || row['月份'] || ''),
    salary_amount: Number(row.salary_amount || row['工资金额'] || 0),
  }));
}