-- 创建 salaries 表（员工工资表）
CREATE TABLE IF NOT EXISTS salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 results 表（计算结果表）
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,
  contribution_base FLOAT NOT NULL,
  company_fee FLOAT NOT NULL,
  calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_salaries_employee ON salaries(employee_name);
CREATE INDEX IF NOT EXISTS idx_results_employee ON results(employee_name);
CREATE INDEX IF NOT EXISTS idx_salaries_month ON salaries(month);

-- 添加注释说明
COMMENT ON TABLE salaries IS '员工工资数据表，存储各员工每月的工资信息';
COMMENT ON TABLE results IS '计算结果表，存储社保公积金计算结果';

COMMENT ON COLUMN salaries.employee_id IS '员工工号，必须唯一';
COMMENT ON COLUMN salaries.employee_name IS '员工姓名';
COMMENT ON COLUMN salaries.month IS '工资月份，格式为 YYYYMM';
COMMENT ON COLUMN salaries.salary_amount IS '该月工资金额（元）';

COMMENT ON COLUMN results.employee_name IS '员工姓名';
COMMENT ON COLUMN results.avg_salary IS '年度月平均工资';
COMMENT ON COLUMN results.contribution_base IS '最终缴费基数';
COMMENT ON COLUMN results.company_fee IS '公司应缴纳金额';
COMMENT ON COLUMN results.calculation_date IS '计算时间';