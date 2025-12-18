# 五险一金计算器 Web 应用项目文档

## 项目概述

### 项目目标
构建一个迷你的"五险一金"计算器Web应用，根据预设的员工工资数据和城市社保标准，计算出公司为每位员工应缴纳的社保公积金费用。

### 核心功能
- 员工工资数据管理
- 城市社保标准管理
- 自动计算公司应缴纳的社保公积金费用
- 结果展示与查询

## 技术栈

### 前端
- **框架**: Next.js 14+
- **UI/样式**: Tailwind CSS
- **类型检查**: TypeScript

### 后端/数据库
- **数据库**: Supabase (PostgreSQL)
- **API**: Next.js API Routes
- **文件上传**: 支持Excel文件解析

## 数据库设计 (Supabase)

### 1. cities (城市标准表)
```sql
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,  -- YYYY格式
  base_min INTEGER NOT NULL,  -- 社保基数下限
  base_max INTEGER NOT NULL,  -- 社保基数上限
  rate FLOAT NOT NULL,  -- 综合缴纳比例 (如0.35表示35%)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. salaries (员工工资表)
```sql
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,  -- 员工工号，唯一性约束
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,  -- YYYYMM格式
  salary_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. results (计算结果表)
```sql
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,  -- 年度月平均工资
  contribution_base FLOAT NOT NULL,  -- 最终缴费基数
  company_fee FLOAT NOT NULL,  -- 公司缴纳金额
  calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 核心业务逻辑

### 计算流程
1. 从 `salaries` 表读取所有员工工资数据
2. 按 `employee_name` 分组，计算每位员工的年度月平均工资
   - 公式：`avg_salary = SUM(salary_amount) / COUNT(DISTINCT month)`
3. 从 `cities` 表获取社保标准（需要指定城市，默认使用佛山）
4. 确定最终缴费基数：
   - 如果 `avg_salary < base_min` → `contribution_base = base_min`
   - 如果 `avg_salary > base_max` → `contribution_base = base_max`
   - 否则 → `contribution_base = avg_salary`
5. 计算公司应缴纳金额：
   - `company_fee = contribution_base * rate`
6. 将结果存入 `results` 表

### 业务规则
- 员工工号（employee_id）必须唯一
- 社保基数按照所在城市的最新标准执行
- 计算结果保留两位小数
- 支持批量计算和结果存储

## 前端页面设计

### 1. 主页 (/)
**布局结构**:
```
┌─────────────────────────────────┐
│           五险一金计算器          │
│                                 │
│  ┌─────────────┐  ┌─────────────┐│
│  │  数据上传    │  │  结果查询    ││
│  │            │  │            ││
│  │  点击进入    │  │  点击进入    ││
│  └─────────────┘  └─────────────┘│
└─────────────────────────────────┘
```

**功能特点**:
- 简洁的卡片式设计
- 清晰的功能分区
- 响应式布局

### 2. 数据上传页 (/upload)
**功能模块**:
- 城市标准Excel上传
  - 文件格式：xlsx/xls
  - 包含字段：city_name, year, base_min, base_max, rate
- 员工工资Excel上传
  - 文件格式：xlsx/xls
  - 包含字段：employee_id, employee_name, month, salary_amount
- 执行计算按钮
  - 触发批量计算流程
  - 显示计算进度

**界面元素**:
```
┌─────────────────────────────────┐
│           数据上传管理           │
│                                 │
│  城市标准上传: [选择文件] [上传]   │
│                                 │
│  员工工资上传: [选择文件] [上传]   │
│                                 │
│          [执行批量计算]          │
│                                 │
│          状态: [计算中...]       │
└─────────────────────────────────┘
```

### 3. 结果查询页 (/results)
**数据展示**:
- 表格形式展示计算结果
- 包含字段：员工姓名、平均工资、缴费基数、公司应缴纳金额
- 支持数据刷新功能

**表格设计**:
```html
<table class="min-w-full">
  <thead>
    <tr class="bg-gray-100">
      <th class="px-6 py-3">员工姓名</th>
      <th class="px-6 py-3">平均工资</th>
      <th class="px-6 py-3">缴费基数</th>
      <th class="px-6 py-3">公司缴纳金额</th>
    </tr>
  </thead>
  <tbody>
    <!-- 数据行 -->
  </tbody>
</table>
```

## 开发任务清单

### Phase 1: 环境搭建
- [ ] 初始化 Next.js 项目
- [ ] 配置 Tailwind CSS
- [ ] 配置 TypeScript
- [ ] 设置 Supabase 项目
- [ ] 配置环境变量

### Phase 2: 数据库设置
- [ ] 创建 Supabase 数据表
- [ ] 设置表关系和约束
- [ ] 添加示例数据
- [ ] 配置 RLS (Row Level Security)

### Phase 3: 后端开发
- [ ] 创建 API 路由
  - [ ] `/api/upload/cities` - 上传城市标准
  - [ ] `/api/upload/salaries` - 上传员工工资
  - [ ] `/api/calculate` - 执行计算
  - [ ] `/api/results` - 获取计算结果
- [ ] 实现Excel文件解析
- [ ] 实现计算逻辑

### Phase 4: 前端开发
- [ ] 创建主页面组件
- [ ] 创建上传页面组件
- [ ] 创建结果展示页面组件
- [ ] 实现文件上传功能
- [ ] 实现表格展示组件

### Phase 5: 测试与优化
- [ ] 单元测试
- [ ] 集成测试
- [ ] UI/UX 优化
- [ ] 错误处理优化
- [ ] 性能优化

## 项目结构

```
sical/
├── src/
│   ├── app/                 # Next.js 13+ App Router
│   │   ├── page.tsx        # 主页
│   │   ├── upload/         # 上传页面
│   │   └── results/        # 结果页面
│   ├── components/         # React组件
│   │   ├── ui/            # 基础UI组件
│   │   ├── forms/         # 表单组件
│   │   └── tables/        # 表格组件
│   ├── lib/               # 工具函数
│   │   ├── supabase.ts    # Supabase客户端
│   │   ├── excel.ts       # Excel解析
│   │   └── calculations.ts # 计算逻辑
│   └── types/             # TypeScript类型定义
├── public/                # 静态资源
├── .env.local            # 环境变量
└── tailwind.config.js    # Tailwind配置
```

## 注意事项

1. **数据验证**: 所有上传数据需要验证格式和完整性
2. **错误处理**: 提供清晰的错误提示信息
3. **用户体验**: 加载状态和进度反馈
4. **数据安全**: 使用 Supabase RLS 保护数据访问
5. **代码规范**: 遵循 TypeScript 和 React 最佳实践

## 后续扩展可能

- 支持多城市并行计算
- 添加历史记录查询
- 导出Excel功能
- 数据可视化图表
- 分页功能
- 批量操作优化