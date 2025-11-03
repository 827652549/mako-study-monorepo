# PostgreSQL Supabase 连接

简单的Supabase PostgreSQL数据库连接脚本。

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置凭证
编辑 `.env.local`：
```
DATABASE_URL=postgresql://postgres.zicshbdkgtzakmnjzzgo:YOUR_PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

### 3. 连接
```bash
npm run connect
```

## 文件说明

- `connect.js` - 连接脚本，执行基本查询
- `.env.local` - 数据库凭证（Git忽略）
- `.gitignore` - Git安全规则

## 连接字符串

使用 Supabase 连接池端点：
```
postgresql://postgres.zicshbdkgtzakmnjzzgo:PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

**用户名：** `postgres.zicshbdkgtzakmnjzzgo`
**密码：** 你的Supabase密码
**主机：** `aws-1-ap-southeast-2.pooler.supabase.com`
**端口：** `5432`
**数据库：** `postgres`
