-- 创建 cities 表（支持多个城市）
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INTEGER NOT NULL,
  base_max INTEGER NOT NULL,
  rate FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 salaries 表
CREATE TABLE IF NOT EXISTS salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 results 表
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,
  contribution_base FLOAT NOT NULL,
  company_fee FLOAT NOT NULL,
  calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加复合唯一约束，防止重复的城市和年份组合
ALTER TABLE cities ADD CONSTRAINT unique_city_year UNIQUE (city_name, year);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_cities_name_year ON cities(city_name, year);
CREATE INDEX IF NOT EXISTS idx_salaries_employee ON salaries(employee_name);
CREATE INDEX IF NOT EXISTS idx_results_employee ON results(employee_name);