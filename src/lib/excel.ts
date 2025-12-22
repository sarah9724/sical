import * as XLSX from 'xlsx';
import type { CityUploadData, SalaryUploadData } from '@/types';

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ParseResult<T> {
  data: T[];
  errors: ValidationError[];
}

export function parseCitiesExcel(buffer: Buffer): ParseResult<CityUploadData> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];

  const data: CityUploadData[] = [];
  const errors: ValidationError[] = [];

  rawData.forEach((row, index) => {
    const rowNum = index + 2; // Excel 行号（第1行是表头）

    const city_name = String(row.city_name || row['城市名'] || '').trim();
    const year = String(row.year || row['年份'] || '').trim();
    const base_min = Number(row.base_min || row['基数下限'] || 0);
    const base_max = Number(row.base_max || row['基数上限'] || 0);
    const rate = Number(row.rate || row['缴纳比例'] || 0);

    // 数据校验
    if (!city_name) {
      errors.push({ row: rowNum, field: 'city_name', message: '城市名不能为空' });
    }
    if (!year) {
      errors.push({ row: rowNum, field: 'year', message: '年份不能为空' });
    }
    if (base_min <= 0) {
      errors.push({ row: rowNum, field: 'base_min', message: '基数下限必须大于0' });
    }
    if (base_max <= 0) {
      errors.push({ row: rowNum, field: 'base_max', message: '基数上限必须大于0' });
    }
    if (base_min > base_max) {
      errors.push({ row: rowNum, field: 'base_min', message: '基数下限不能大于基数上限' });
    }
    if (rate <= 0 || rate > 1) {
      errors.push({ row: rowNum, field: 'rate', message: '缴纳比例必须在0到1之间（如0.16表示16%）' });
    }

    data.push({ city_name, year, base_min, base_max, rate });
  });

  return { data, errors };
}

export function parseSalariesExcel(buffer: Buffer): ParseResult<SalaryUploadData> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];

  const data: SalaryUploadData[] = [];
  const errors: ValidationError[] = [];

  rawData.forEach((row, index) => {
    const rowNum = index + 2; // Excel 行号（第1行是表头）

    const employee_id = String(row.employee_id || row['员工工号'] || '').trim();
    const employee_name = String(row.employee_name || row['员工姓名'] || '').trim();
    const city = String(row.city || row['城市'] || '').trim();
    const month = String(row.month || row['月份'] || '').trim();
    const salary_amount = Number(row.salary_amount || row['工资金额'] || 0);

    // 数据校验
    if (!employee_id) {
      errors.push({ row: rowNum, field: 'employee_id', message: '员工工号不能为空' });
    }
    if (!employee_name) {
      errors.push({ row: rowNum, field: 'employee_name', message: '员工姓名不能为空' });
    }
    if (!city) {
      errors.push({ row: rowNum, field: 'city', message: '城市不能为空' });
    }
    if (!month) {
      errors.push({ row: rowNum, field: 'month', message: '月份不能为空' });
    }
    if (salary_amount < 0) {
      errors.push({ row: rowNum, field: 'salary_amount', message: '工资金额不能为负数' });
    }

    data.push({ employee_id, employee_name, city, month, salary_amount });
  });

  return { data, errors };
}