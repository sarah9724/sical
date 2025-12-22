import { supabaseAdmin } from './supabase';
import { localStorageSalaries, localStorageCities, localStorageResults } from './local-storage';
import type { Salary, City } from '@/types';

export interface CalculationResult {
  employee_id: string;
  employee_name: string;
  city: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
}

interface EmployeeData {
  employee_id: string;
  employee_name: string;
  city: string;
  // key: month, value: { salary_amount, created_at }
  monthlyRecords: Map<string, { salary_amount: number; created_at: string }>;
}

// 四舍五入到两位小数
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function calculateContributions(): Promise<CalculationResult[]> {
  // 检查是否使用本地存储
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const useLocalStorage = !supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder');

  // 1. 获取所有员工工资数据
  let salaries: Salary[] = [];

  if (useLocalStorage) {
    salaries = localStorageSalaries.getAll();
  } else {
    const { data, error } = await supabaseAdmin
      .from('salaries')
      .select('*')
      .order('created_at', { ascending: false }); // 按创建时间降序，用于处理重复记录
    if (error) {
      throw new Error('获取工资数据失败：' + error.message);
    }
    salaries = data || [];
  }

  if (!salaries || salaries.length === 0) {
    throw new Error('没有找到工资数据');
  }

  // 2. 按 employee_id 分组，处理同月重复记录（取最新）
  const employeeMap = new Map<string, EmployeeData>();

  for (const salary of salaries) {
    const empId = salary.employee_id;

    if (!employeeMap.has(empId)) {
      employeeMap.set(empId, {
        employee_id: empId,
        employee_name: salary.employee_name,
        city: salary.city,
        monthlyRecords: new Map(),
      });
    }

    const empData = employeeMap.get(empId)!;
    const month = salary.month;

    // 如果该月份已有记录，比较 created_at 取最新的
    const existingRecord = empData.monthlyRecords.get(month);
    const currentCreatedAt = salary.created_at || '';

    if (!existingRecord || currentCreatedAt > existingRecord.created_at) {
      empData.monthlyRecords.set(month, {
        salary_amount: salary.salary_amount,
        created_at: currentCreatedAt,
      });
    }
  }

  // 3. 计算每个员工的平均工资
  const employeeAverages: Array<{
    employee_id: string;
    employee_name: string;
    city: string;
    avg_salary: number;
  }> = [];

  for (const empData of Array.from(employeeMap.values())) {
    let totalSalary = 0;
    let monthCount = 0;

    for (const record of Array.from(empData.monthlyRecords.values())) {
      totalSalary += record.salary_amount;
      monthCount++;
    }

    if (monthCount > 0) {
      employeeAverages.push({
        employee_id: empData.employee_id,
        employee_name: empData.employee_name,
        city: empData.city,
        avg_salary: round2(totalSalary / monthCount),
      });
    }
  }

  // 4. 获取城市标准
  let cities: City[] = [];

  if (useLocalStorage) {
    cities = localStorageCities.getAll();
  } else {
    const { data, error } = await supabaseAdmin
      .from('cities')
      .select('*')
      .order('city_name', { ascending: true })
      .order('year', { ascending: false });
    if (error) {
      throw new Error('获取城市标准失败：' + error.message);
    }
    cities = data || [];
  }

  if (!cities || cities.length === 0) {
    throw new Error('没有找到城市标准，请先上传城市标准数据');
  }

  // 为每个城市保留最新年份的标准
  const cityStandardMap = new Map<string, City>();
  for (const city of cities) {
    if (!cityStandardMap.has(city.city_name)) {
      cityStandardMap.set(city.city_name, city);
    }
  }

  // 5. 计算缴费基数和公司缴纳金额
  const results: CalculationResult[] = [];
  const missingCities: string[] = [];

  for (const employee of employeeAverages) {
    const cityStandard = cityStandardMap.get(employee.city);

    if (!cityStandard) {
      // 记录找不到城市标准的情况
      if (!missingCities.includes(employee.city)) {
        missingCities.push(employee.city);
      }
      continue;
    }

    let contribution_base: number;

    if (employee.avg_salary < cityStandard.base_min) {
      contribution_base = cityStandard.base_min;
    } else if (employee.avg_salary > cityStandard.base_max) {
      contribution_base = cityStandard.base_max;
    } else {
      contribution_base = employee.avg_salary;
    }

    const company_fee = round2(contribution_base * cityStandard.rate);

    results.push({
      employee_id: employee.employee_id,
      employee_name: employee.employee_name,
      city: employee.city,
      avg_salary: employee.avg_salary,
      contribution_base: round2(contribution_base),
      company_fee,
    });
  }

  // 如果有城市找不到标准，抛出错误
  if (missingCities.length > 0) {
    throw new Error(`以下城市没有找到对应的标准数据：${missingCities.join('、')}。请先上传这些城市的标准数据。`);
  }

  if (results.length === 0) {
    throw new Error('没有可计算的员工数据');
  }

  // 6. 保存计算结果
  if (useLocalStorage) {
    await localStorageResults.delete();
    const { error } = await localStorageResults.insert(results);
    if (error) {
      throw new Error('保存计算结果失败：' + error);
    }
  } else {
    try {
      await supabaseAdmin.from('results').delete().neq('id', -1);
      const { error } = await supabaseAdmin.from('results').insert(results);
      if (error) {
        throw error;
      }
    } catch (error) {
      throw new Error('保存计算结果失败：' + (error as any).message);
    }
  }

  return results;
}
