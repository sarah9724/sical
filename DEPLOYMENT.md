# Vercel 部署指南

## 方法一：使用 Vercel CLI 自动配置环境变量

### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```

### 3. 链接项目
```bash
vercel link
```

### 4. 设置环境变量
```bash
# 设置 Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL

# 设置 Supabase 匿名密钥
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 设置 Supabase 服务角色密钥
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

当提示输入值时，分别输入：
- **NEXT_PUBLIC_SUPABASE_URL**: `https://gmncydqemixoxscsxggj.supabase.co`
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbmN5ZHFlbWl4b3hzY3N4Z2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwODE0MDAsImV4cCI6MjA4MTY1NzQwMH0.gYnJzMrunaitoLEsGNae23U7G78HaPxO60hPFhrbkiA`
- **SUPABASE_SERVICE_ROLE_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbmN5ZHFlbWl4b3hzY3N4Z2dqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA4MTQwMCwiZXhwIjoyMDgxNjU3NDAwfQ.eFkQkwRkehjQ1aXXugttmfESgHWDlRV-xgT4tRyVXlQ`

选择环境范围：`production`, `preview`, `development`

### 5. 部署项目
```bash
vercel --prod
```

## 方法二：通过 Vercel Dashboard 手动配置

### 1. 访问 Vercel Dashboard
- 登录 [https://vercel.com/dashboard](https://vercel.com/dashboard)
- 找到你的项目或点击 "New Project" 导入 GitHub 仓库

### 2. 配置环境变量
- 进入项目设置页面
- 点击 "Environment Variables"
- 添加以下环境变量：

| 名称 | 值 | 环境 |
|------|-----|------|
| NEXT_PUBLIC_SUPABASE_URL | https://gmncydqemixoxscsxggj.supabase.co | Production, Preview, Development |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... | Production, Preview, Development |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... | Production, Preview, Development |

### 3. 部署项目
- 点击 "Deployments" 标签
- 点击 "Redeploy" 或等待自动部署

## 验证部署

部署完成后，访问以下端点验证功能：

1. **测试数据库连接**：
   ```
   https://your-app.vercel.app/api/test-simple
   ```

2. **测试计算功能**：
   ```bash
   curl -X POST https://your-app.vercel.app/api/calculate
   ```

3. **访问应用主页**：
   ```
   https://your-app.vercel.app
   ```

## 常见问题

### 1. 环境变量未生效
- 确保环境变量名称拼写正确
- 检查是否选择了正确的环境（Production）
- 尝试重新部署项目

### 2. Supabase 连接失败
- 验证 Supabase URL 和密钥是否正确
- 确认 Supabase 项目状态正常
- 检查数据库表是否已创建

### 3. 构建失败
- 确保 Node.js 版本 >= 18
- 检查 package.json 中的 engines 配置
- 查看 Vercel 构建日志获取详细错误信息

## 数据库设置

如果数据库表未创建，请在 Supabase SQL 编辑器中执行：

```sql
-- 创建 cities 表
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

-- 创建 salaries 表
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 results 表
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,
  contribution_base FLOAT NOT NULL,
  company_fee FLOAT NOT NULL,
  calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```