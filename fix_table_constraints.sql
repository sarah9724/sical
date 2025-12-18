-- 修复 salaries 表
DROP TABLE IF EXISTS salaries CASCADE;

CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建复合唯一约束（employee_id + month）
ALTER TABLE salaries ADD CONSTRAINT unique_employee_month UNIQUE (employee_id, month);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_salaries_employee ON salaries(employee_name);
CREATE INDEX IF NOT EXISTS idx_salaries_month ON salaries(month);

-- 修复 cities 表（确保有正确的约束）
DROP TABLE IF EXISTS cities CASCADE;

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INTEGER NOT NULL,
  base_max INTEGER NOT NULL,
  rate FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建复合唯一约束（city_name + year）
ALTER TABLE cities ADD CONSTRAINT unique_city_year UNIQUE (city_name, year);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cities_name_year ON cities(city_name, year);

-- 确保 results 表存在
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,
  contribution_base FLOAT NOT NULL,
  company_fee FLOAT NOT NULL,
  calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_results_employee ON results(employee_name);