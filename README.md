# 五险一金计算器

一个基于 Next.js 和 Supabase 的迷你"五险一金"计算器 Web 应用。

## 功能特点

- 支持城市社保标准的 Excel 文件上传
- 支持员工工资数据的 Excel 文件上传
- 自动计算每位员工的社保公积金缴纳金额
- 清晰的结果展示界面

## 技术栈

- **前端框架**: Next.js 14+ (App Router)
- **UI/样式**: Tailwind CSS
- **类型检查**: TypeScript
- **数据库**: Supabase (PostgreSQL)
- **文件处理**: xlsx

## 快速开始

### 1. 环境准备

确保你的系统已安装：
- Node.js 18+
- npm 或 yarn

### 2. 克隆项目

```bash
git clone <repository-url>
cd sical
```

### 3. 安装依赖

```bash
npm install
```

### 4. 配置环境变量

创建 `.env.local` 文件并配置 Supabase：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

参考 `.env.local.example` 文件。

### 5. 设置 Supabase 数据表

在 Supabase SQL 编辑器中执行以下 SQL：

```sql
-- 城市标准表
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

-- 员工工资表
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 计算结果表
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,
  contribution_base FLOAT NOT NULL,
  company_fee FLOAT NOT NULL,
  calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. 运行项目

```bash
npm run dev
```

打开浏览器访问 `http://localhost:3000`。

## 使用说明

### 1. 上传城市标准数据

准备 Excel 文件，包含以下列：
- `city_name`: 城市名称
- `year`: 年份
- `base_min`: 社保基数下限
- `base_max`: 社保基数上限
- `rate`: 综合缴纳比例

### 2. 上传员工工资数据

准备 Excel 文件，包含以下列：
- `employee_id`: 员工工号（唯一）
- `employee_name`: 员工姓名
- `month`: 月份（YYYYMM 格式）
- `salary_amount`: 工资金额

### 3. 执行计算

点击"执行批量计算"按钮，系统会自动：
- 计算每位员工的年度月平均工资
- 根据城市标准确定缴费基数
- 计算公司应缴纳金额

### 4. 查看结果

在结果页面查看计算结果，包括：
- 员工姓名
- 平均工资
- 缴费基数
- 公司缴纳金额

## 项目结构

```
sical/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 路由
│   │   ├── upload/         # 上传页面
│   │   ├── results/        # 结果页面
│   │   ├── layout.tsx      # 根布局
│   │   ├── page.tsx        # 主页
│   │   └── globals.css     # 全局样式
│   ├── components/         # React 组件
│   ├── lib/               # 工具函数
│   │   ├── supabase.ts    # Supabase 客户端
│   │   ├── local-storage.ts # 本地存储（开发用）
│   │   ├── excel.ts       # Excel 解析
│   │   └── calculations.ts # 计算逻辑
│   └── types/             # TypeScript 类型
├── public/                # 静态资源
├── test-data/             # 测试数据文件
├── csv-files/             # CSV 导出文件
├── create_tables.sql      # 数据库建表脚本
└── README.md
```

## 部署说明

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 自动部署完成

### 其他平台部署

1. 构建项目：`npm run build`
2. 启动生产服务器：`npm start`

## 计算规则

1. **平均工资计算**: 将同一员工的所有月份工资求平均
2. **缴费基数确定**:
   - 低于基数下限：使用下限
   - 高于基数上限：使用上限
   - 在中间：使用实际平均工资
3. **公司缴纳金额**: 缴费基数 × 缴纳比例

## 注意事项

- 员工工号必须唯一
- Excel 文件格式必须正确
- 计算前确保已上传城市标准和员工工资数据
- 目前默认使用佛山的社保标准

## 开发计划

- [ ] 支持多城市选择
- [ ] 添加数据导出功能
- [ ] 实现数据分页
- [ ] 添加数据可视化图表
- [ ] 优化错误处理和用户体验

## 许可证

MIT