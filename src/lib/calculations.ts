import { supabaseAdmin } from './supabase';
import { localStorageSalaries, localStorageCities, localStorageResults } from './local-storage';

export interface CalculationResult {
  employee_name: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
}

export async function calculateContributions(): Promise<CalculationResult[]> {
  // 检查是否使用本地存储
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const useLocalStorage = !supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder');

  // 1. 获取所有员工工资数据
  let salaries: any[] = [];

  if (useLocalStorage) {
    salaries = localStorageSalaries.getAll();
  } else {
    const { data, error } = await supabaseAdmin.from('salaries').select('*');
    if (error) {
      throw new Error('获取工资数据失败：' + error.message);
    }
    salaries = data || [];
  }

  if (!salaries || salaries.length === 0) {
    throw new Error('没有找到工资数据');
  }

  // 2. 按员工分组计算平均工资
  const employeeGroups = salaries.reduce((acc: any, salary) => {
    if (!acc[salary.employee_name]) {
      acc[salary.employee_name] = {
        totalSalary: 0,
        monthCount: new Set(),
      };
    }
    acc[salary.employee_name].totalSalary += salary.salary_amount;
    acc[salary.employee_name].monthCount.add(salary.month);
    return acc;
  }, {});

  const averageSalaries = Object.entries(employeeGroups).map(([name, data]: any) => ({
    employee_name: name,
    avg_salary: data.totalSalary / data.monthCount.size,
  }));

  // 3. 获取城市标准（获取所有城市，选择最新年份的标准）
  let cities: any[] = [];

  if (useLocalStorage) {
    cities = localStorageCities.getAll();
    // 按年份降序排序，获取每个城市的最新标准
    cities.sort((a: any, b: any) => {
      if (a.city_name !== b.city_name) {
        return a.city_name.localeCompare(b.city_name);
      }
      return b.year.localeCompare(a.year);
    });
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

  // 为每个城市保留最新的标准（按年份降序排序后的第一条）
  const cityMap = new Map();
  cities.forEach((city: any) => {
    if (!cityMap.has(city.city_name)) {
      cityMap.set(city.city_name, city);
    }
  });

  // 默认使用第一个城市的标准（通常是佛山的标准）
  const cityStandard = Array.from(cityMap.values())[0];

  // 4. 计算缴费基数和公司缴纳金额
  const results: CalculationResult[] = averageSalaries.map((employee) => {
    let contribution_base: number;

    if (employee.avg_salary < cityStandard.base_min) {
      contribution_base = cityStandard.base_min;
    } else if (employee.avg_salary > cityStandard.base_max) {
      contribution_base = cityStandard.base_max;
    } else {
      contribution_base = employee.avg_salary;
    }

    const company_fee = contribution_base * cityStandard.rate;

    return {
      employee_name: employee.employee_name,
      avg_salary: employee.avg_salary,
      contribution_base,
      company_fee,
    };
  });

  // 5. 保存计算结果
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